import { ALBEvent, ALBResult } from 'aws-lambda';
import type { Prisma } from '../../generated/prisma/client';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateBaliseWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { archiveS3FilesWithCleanup } from '../../utils/s3utils';

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

// Type for balise with included history
type BaliseWithHistory = {
  id: string;
  secondaryId: number;
  version: number;
  description: string;
  fileTypes: string[];
  createdBy: string;
  createdTime: Date;
  locked: boolean;
  lockedBy: string | null;
  lockedTime: Date | null;
  deletedAt: Date | null;
  deletedBy: string | null;
  history: Array<{
    id: string;
    secondaryId: number;
    version: number;
    description: string;
    fileTypes: string[];
    createdBy: string;
    createdTime: Date;
    locked: boolean;
    lockedBy: string | null;
    lockedTime: Date | null;
    versionCreatedTime: Date;
  }>;
};

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

// Archive a single balise in database
async function archiveBaliseInDatabase(balise: BaliseWithHistory, archivedSecondaryId: string, userUid: string) {
  await database.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1. Create archive entry for the main balise
    const archivedBalise = await tx.baliseArchive.create({
      data: {
        originalId: balise.id,
        originalSecondaryId: balise.secondaryId,
        archivedSecondaryId: archivedSecondaryId,
        version: balise.version,
        description: balise.description,
        fileTypes: balise.fileTypes,
        createdBy: balise.createdBy,
        createdTime: balise.createdTime,
        locked: balise.locked,
        lockedBy: balise.lockedBy,
        lockedTime: balise.lockedTime,
        deletedAt: balise.deletedAt,
        deletedBy: balise.deletedBy,
        archivedBy: userUid,
      },
    });

    // 2. Archive all version history
    for (const version of balise.history) {
      await tx.baliseArchiveVersion.create({
        data: {
          baliseArchiveId: archivedBalise.id,
          originalVersionId: version.id,
          originalSecondaryId: version.secondaryId,
          archivedSecondaryId: archivedSecondaryId,
          version: version.version,
          description: version.description,
          fileTypes: version.fileTypes,
          createdBy: version.createdBy,
          createdTime: version.createdTime,
          locked: version.locked,
          lockedBy: version.lockedBy,
          lockedTime: version.lockedTime,
          versionCreatedTime: version.versionCreatedTime,
        },
      });
    }

    // 3. Delete version history from active table
    await tx.baliseVersion.deleteMany({
      where: { baliseId: balise.id },
    });

    // 4. Delete main balise from active table
    await tx.balise.delete({
      where: { id: balise.id },
    });
  });
}

// Archive S3 files for a single balise
async function archiveS3Files(
  balise: BaliseWithHistory,
  baliseId: number,
  archivedSecondaryId: string,
  userId: string,
): Promise<void> {
  // Collect all files that need to be archived
  const filesToArchive: Array<{ sourceKey: string; archiveKey: string }> = [];

  // Collect all versions including current version and history
  const allVersions = [
    { version: balise.version, fileTypes: balise.fileTypes },
    ...balise.history.map((h) => ({
      version: h.version,
      fileTypes: h.fileTypes,
    })),
  ];

  // Remove duplicates by version number
  const uniqueVersions = Array.from(new Map(allVersions.map((v) => [v.version, v])).values());

  for (const versionData of uniqueVersions) {
    for (const fileName of versionData.fileTypes) {
      const sourceKey = `balise_${baliseId}/v${versionData.version}/${fileName}`;
      const archiveKey = `archive/${archivedSecondaryId}/v${versionData.version}/${fileName}`;
      filesToArchive.push({ sourceKey, archiveKey });
    }
  }

  // Execute archiving with parallel processing
  await archiveS3FilesWithCleanup(BALISES_BUCKET_NAME, filesToArchive, userId);
}

// Delete a single balise (archive to database and S3)
async function deleteSingleBalise(balise: BaliseWithHistory, userUid: string): Promise<DeleteResult> {
  const baliseId = balise.secondaryId;

  try {
    // Generate timestamped archive ID
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14);
    const archivedSecondaryId = `balise_${baliseId}_${timestamp}`;

    // Archive to database
    await archiveBaliseInDatabase(balise, archivedSecondaryId, userUid);

    // Archive S3 files
    await archiveS3Files(balise, baliseId, archivedSecondaryId, userUid);

    log.info(`[${userUid}] Successfully deleted balise ${baliseId}`);

    return {
      baliseId,
      success: true,
    };
  } catch (error) {
    log.error(`[${userUid}] Failed to delete balise ${baliseId}: ${error}`);
    return {
      baliseId,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Process bulk deletion with concurrency control
async function processBulkDeletion(baliseIds: number[], userUid: string): Promise<BulkDeleteResponse> {
  // Fetch balises and filter out locked ones
  const { balises, skipped } = await fetchBalisesForDeletion(baliseIds);

  log.info(`[${userUid}] Processing bulk delete: ${balises.length} balises, ${skipped.length} skipped`);

  // Process deletions with concurrency limit to avoid overwhelming database connection pool
  const CONCURRENCY_LIMIT = 5;
  const results: DeleteResult[] = [];

  for (let i = 0; i < balises.length; i += CONCURRENCY_LIMIT) {
    const chunk = balises.slice(i, i + CONCURRENCY_LIMIT);
    const chunkResults = await Promise.all(chunk.map((balise) => deleteSingleBalise(balise, userUid)));
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
