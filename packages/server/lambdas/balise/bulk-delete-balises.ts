import { ALBEvent, ALBResult } from 'aws-lambda';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateBaliseWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { type BaliseWithHistory, deleteSingleBalise } from '../../utils/baliseArchiveUtils';

const database = await DatabaseClient.build();
const BALISES_BUCKET_NAME = process.env.BALISES_BUCKET_NAME || '';

interface BulkDeleteRequest {
  baliseIds: number[]; // Array of secondaryId values
}

interface DeleteResult {
  baliseId: number;
  success: boolean;
  error?: string;
  skipped?: boolean; // True if balise was locked or not found
}

interface BulkDeleteResponse {
  totalRequested: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  results: DeleteResult[];
}

// Parse and validate request body
function parseRequestBody(event: ALBEvent): BulkDeleteRequest {
  if (!event.body) {
    throw new Error('MISSING_REQUEST_BODY');
  }

  const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf-8') : event.body;

  let parsed: BulkDeleteRequest;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new Error('INVALID_JSON');
  }

  if (!Array.isArray(parsed.baliseIds) || parsed.baliseIds.length === 0) {
    throw new Error('INVALID_BALISE_IDS');
  }

  // Validate all IDs are numbers
  if (!parsed.baliseIds.every((id) => typeof id === 'number' && !isNaN(id))) {
    throw new Error('INVALID_BALISE_IDS');
  }

  return parsed;
}

// Fetch balises with history, filtering out locked ones
async function fetchBalisesForDeletion(
  baliseIds: number[],
): Promise<{ balises: BaliseWithHistory[]; skipped: number[] }> {
  const balises = await database.balise.findMany({
    where: { secondaryId: { in: baliseIds } },
    include: { history: true },
  });

  const unlocked: BaliseWithHistory[] = [];
  const skipped: number[] = [];

  for (const balise of balises) {
    if (balise.locked) {
      skipped.push(balise.secondaryId);
      log.info(`Skipping locked balise ${balise.secondaryId}`);
    } else {
      unlocked.push(balise);
    }
  }

  // Track balises that don't exist
  const foundIds = new Set(balises.map((b) => b.secondaryId));
  for (const requestedId of baliseIds) {
    if (!foundIds.has(requestedId)) {
      skipped.push(requestedId);
      log.info(`Skipping non-existent balise ${requestedId}`);
    }
  }

  return { balises: unlocked, skipped };
}

// Execute single delete with error handling for bulk operations
async function executeDelete(balise: BaliseWithHistory, userUid: string): Promise<DeleteResult> {
  const baliseId = balise.secondaryId;
  try {
    await deleteSingleBalise(database, BALISES_BUCKET_NAME, balise, userUid);
    return { baliseId, success: true };
  } catch (error) {
    log.error(`[${userUid}] Failed to delete balise ${baliseId}: ${error}`);
    return { baliseId, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Process bulk deletion with concurrency control
async function processBulkDeletion(baliseIds: number[], userUid: string): Promise<BulkDeleteResponse> {
  // Fetch balises and filter out locked ones
  const { balises, skipped } = await fetchBalisesForDeletion(baliseIds);

  log.info(`[${userUid}] Processing bulk delete: ${balises.length} balises, ${skipped.length} skipped`);

  // Process deletions with concurrency limit to avoid overwhelming database connection pool
  const CONCURRENCY_LIMIT = 10;
  const results: DeleteResult[] = [];

  for (let i = 0; i < balises.length; i += CONCURRENCY_LIMIT) {
    const chunk = balises.slice(i, i + CONCURRENCY_LIMIT);
    const chunkResults = await Promise.all(chunk.map((balise) => executeDelete(balise, userUid)));
    results.push(...chunkResults);
  }

  // Add skipped results
  const skippedResults: DeleteResult[] = skipped.map((baliseId) => ({
    baliseId,
    success: false,
    skipped: true,
    error: 'Balise is locked or does not exist',
  }));

  const allResults = [...results, ...skippedResults];
  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  return {
    totalRequested: baliseIds.length,
    successCount,
    failureCount: failureCount + skipped.length,
    skippedCount: skipped.length,
    results: allResults,
  };
}

// Handle specific error types
function handleBulkDeleteError(err: unknown): ALBResult {
  const errorMessage = err instanceof Error ? err.message : String(err);

  if (errorMessage === 'MISSING_REQUEST_BODY') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Pyyntö on tyhjä' }),
    };
  }

  if (errorMessage === 'INVALID_JSON' || errorMessage === 'INVALID_BALISE_IDS') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Virheellinen pyyntö' }),
    };
  }

  log.error(err);
  return getRataExtraLambdaError(err);
}

export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    validateBaliseWriteUser(user);

    const request = parseRequestBody(event);

    log.info(user, `Bulk delete request for ${request.baliseIds.length} balises`);

    const response = await processBulkDeletion(request.baliseIds, user.uid);

    log.info(
      user,
      `Bulk delete completed: ${response.successCount} succeeded, ${response.failureCount} failed, ${response.skippedCount} skipped`,
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    };
  } catch (err) {
    return handleBulkDeleteError(err);
  }
}
