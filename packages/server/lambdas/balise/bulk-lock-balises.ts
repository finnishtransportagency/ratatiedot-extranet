import { ALBEvent, ALBResult } from 'aws-lambda';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateBaliseWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';

const database = await DatabaseClient.build();

interface BulkLockRequest {
  baliseIds: number[];
  lockReason: string;
}

interface LockResult {
  baliseId: number;
  success: boolean;
  error?: string;
  skipped?: boolean;
}

interface BulkLockResponse {
  totalRequested: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  results: LockResult[];
}

// Parse and validate request body
function parseRequestBody(event: ALBEvent): BulkLockRequest {
  if (!event.body) {
    throw new Error('MISSING_REQUEST_BODY');
  }

  const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf-8') : event.body;

  let parsed: BulkLockRequest;
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

  // Validate lockReason
  if (typeof parsed.lockReason !== 'string' || parsed.lockReason.trim().length === 0) {
    throw new Error('INVALID_LOCK_REASON');
  }

  return { ...parsed, lockReason: parsed.lockReason.trim() };
}

// Execute single lock with error handling for bulk operations
async function executeLock(baliseId: number, userUid: string, lockReason: string): Promise<LockResult> {
  try {
    const balise = await database.balise.findUnique({
      where: { secondaryId: baliseId },
    });

    if (!balise) {
      log.info(`Skipping non-existent balise ${baliseId}`);
      return { baliseId, success: false, skipped: true, error: 'Balise not found' };
    }

    // Skip already locked balises
    if (balise.locked) {
      log.info(`Skipping already locked balise ${baliseId}`);
      return { baliseId, success: false, skipped: true, error: 'Already locked' };
    }

    // Lock the balise
    await database.balise.update({
      where: { secondaryId: baliseId },
      data: {
        locked: true,
        lockedBy: userUid,
        lockedTime: new Date(),
        lockedAtVersion: balise.version,
        lockReason,
      },
    });

    return { baliseId, success: true };
  } catch (error) {
    log.error(`Failed to lock balise ${baliseId}: ${error}`);
    return { baliseId, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Process bulk locking with concurrency control
async function processBulkLock(baliseIds: number[], userUid: string, lockReason: string): Promise<BulkLockResponse> {
  log.info(`[${userUid}] Processing bulk lock for ${baliseIds.length} balises`);

  // Process locks with concurrency limit to avoid overwhelming database connection pool
  const CONCURRENCY_LIMIT = 10;
  const results: LockResult[] = [];

  for (let i = 0; i < baliseIds.length; i += CONCURRENCY_LIMIT) {
    const chunk = baliseIds.slice(i, i + CONCURRENCY_LIMIT);
    const chunkResults = await Promise.all(chunk.map((baliseId) => executeLock(baliseId, userUid, lockReason)));
    results.push(...chunkResults);
  }

  const successCount = results.filter((r) => r.success).length;
  const skippedCount = results.filter((r) => r.skipped).length;
  const failureCount = results.filter((r) => !r.success && !r.skipped).length;

  return {
    totalRequested: baliseIds.length,
    successCount,
    failureCount,
    skippedCount,
    results,
  };
}

// Handle specific error types
function handleBulkLockError(err: unknown): ALBResult {
  const errorMessage = err instanceof Error ? err.message : String(err);

  if (errorMessage === 'MISSING_REQUEST_BODY') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Pyyntö on tyhjä' }),
    };
  }

  if (errorMessage === 'INVALID_JSON') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Virheellinen JSON-muoto' }),
    };
  }

  if (errorMessage === 'INVALID_BALISE_IDS') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Virheelliset baliisi-tunnukset' }),
    };
  }

  if (errorMessage === 'INVALID_LOCK_REASON') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Lukitsemisen syy on pakollinen' }),
    };
  }

  return getRataExtraLambdaError(err);
}

export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    log.info(user, `Bulk lock balises request`);

    validateBaliseWriteUser(user);

    const request = parseRequestBody(event);
    const response = await processBulkLock(request.baliseIds, user.uid, request.lockReason);

    log.info(
      user,
      `Bulk lock completed: ${response.successCount} locked, ${response.skippedCount} skipped, ${response.failureCount} failed`,
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    };
  } catch (err) {
    log.error(err);
    return handleBulkLockError(err);
  }
}
