import { ALBEvent, ALBResult } from 'aws-lambda';
import type { Prisma } from '../../generated/prisma/client';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateBaliseWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { archiveS3FilesWithCleanup } from '../../utils/s3utils';

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

const database = await DatabaseClient.build();
const BALISES_BUCKET_NAME = process.env.BALISES_BUCKET_NAME || '';

// Extract and validate balise ID from the request path
async function parseAndValidateBaliseId(event: ALBEvent): Promise<number> {
  const pathParts = event.path.split('/').filter((p) => p);
  const baliseIdStr = pathParts[pathParts.indexOf('balise') + 1];
  const baliseId = parseInt(baliseIdStr || '0', 10);

  if (!baliseId || isNaN(baliseId)) {
    throw new Error('INVALID_BALISE_ID');
  }

  return baliseId;
}

// Fetch balise with all version history
async function fetchBaliseWithHistory(baliseId: number) {
  const balise = await database.balise.findUnique({
    where: { secondaryId: baliseId },
    include: {
      history: true,
    },
  });

  if (!balise) {
    throw new Error('BALISE_NOT_FOUND');
  }

  return balise;
}

// Archive balise and its version history in database
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

// Move S3 files from active to archive paths
async function archiveS3Files(
  balise: BaliseWithHistory,
  baliseId: number,
  archivedSecondaryId: string,
  userId: string,
): Promise<number> {
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

  // Execute archiving with proper error handling and cleanup
  const archiveResults = await archiveS3FilesWithCleanup(BALISES_BUCKET_NAME, filesToArchive, userId);

  if (archiveResults.failureCount > 0) {
    log.warn(
      { userId },
      `Archive completed with ${archiveResults.failureCount} failures out of ${filesToArchive.length} files`,
    );
  }

  return archiveResults.successCount;
}

// Generate archive success response
function createSuccessResponse(
  baliseId: number,
  archivedSecondaryId: string,
  uniqueVersionsCount: number,
  archivedFilesCount: number,
): ALBResult {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Balise archived successfully - secondary ID is now available for reuse',
      originalSecondaryId: baliseId,
      archivedSecondaryId: archivedSecondaryId,
      archivedVersions: uniqueVersionsCount,
      archivedFiles: archivedFilesCount,
    }),
  };
}

// Handle specific error types
function handleArchiveError(err: unknown): ALBResult {
  const errorMessage = err instanceof Error ? err.message : String(err);

  if (errorMessage === 'INVALID_BALISE_ID') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Virheellinen tai puuttuva baliisi-tunnus' }),
    };
  }

  if (errorMessage === 'BALISE_NOT_FOUND') {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Baliisia ei löytynyt' }),
    };
  }

  log.error(err);
  return getRataExtraLambdaError(err);
}

export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    const baliseId = await parseAndValidateBaliseId(event);

    log.info(user, `Archive balise id: ${baliseId}, path: ${event.path}`);

    validateBaliseWriteUser(user);

    const balise = await fetchBaliseWithHistory(baliseId);

    // Generate timestamped archive ID to ensure uniqueness across multiple archival events
    // Format: balise_12345_20231205143022 (YYYYMMDDHHMMSS)
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14); // YYYYMMDDHHMMSS
    const archivedSecondaryId = `balise_${baliseId}_${timestamp}`;

    await archiveBaliseInDatabase(balise, archivedSecondaryId, user.uid);

    log.info(user, `Successfully moved balise ${baliseId} to archive with ${balise.history.length} versions`);

    const archivedFilesCount = await archiveS3Files(balise, baliseId, archivedSecondaryId, user.uid);

    log.info(user, `Successfully archived balise ${baliseId} and moved ${archivedFilesCount} S3 files to archive`);

    // Calculate unique versions count for response
    const allVersions = [
      { version: balise.version, fileTypes: balise.fileTypes },
      ...balise.history.map((h: BaliseWithHistory['history'][0]) => ({
        version: h.version,
        fileTypes: h.fileTypes,
      })),
    ];
    const uniqueVersionsCount = Array.from(new Map(allVersions.map((v) => [v.version, v])).values()).length;

    return createSuccessResponse(baliseId, archivedSecondaryId, uniqueVersionsCount, archivedFilesCount);
  } catch (err) {
    return handleArchiveError(err);
  }
}
