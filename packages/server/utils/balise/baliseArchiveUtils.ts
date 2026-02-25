import type { Prisma } from '../../generated/prisma/client';
import { copyFilesToArchive, deleteOriginalFiles } from '../s3utils';
import { log } from '../logger';
import type { DatabaseClient } from '../../lambdas/database/client';

// Type for balise with included history
export type BaliseWithHistory = {
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

/**
 * Generate a timestamped archive secondary ID for a balise
 * Format: balise_12345_20231205143022 (YYYYMMDDHHMMSS)
 */
export function generateArchiveSecondaryId(baliseId: number): string {
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14);
  return `balise_${baliseId}_${timestamp}`;
}

/**
 * Archive balise and its version history in database using a transaction
 * @param tx - Prisma transaction client
 * @param balise - Balise with history to archive
 * @param archivedSecondaryId - Archive identifier
 * @param userUid - User performing the archival
 */
export async function archiveBaliseInDatabase(
  tx: Prisma.TransactionClient,
  balise: BaliseWithHistory,
  archivedSecondaryId: string,
  userUid: string,
) {
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
}

/**
 * Fetch balise with all version history
 * @param database - Database client instance
 * @param baliseId - Secondary ID of the balise to fetch
 * @returns Balise with history
 * @throws Error if balise not found
 */
export async function fetchBaliseWithHistory(
  database: Awaited<ReturnType<typeof DatabaseClient.build>>,
  baliseId: number,
): Promise<BaliseWithHistory> {
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

/**
 * Delete (archive) a single balise - core deletion logic with safe ordering
 * Order: 1) Copy S3 to archive, 2) DB transaction, 3) Delete S3 originals
 * This ensures data safety - if any step fails, no data is lost
 * @param database - Database client instance
 * @param bucketName - S3 bucket name
 * @param balise - Balise with history to delete
 * @param userUid - User performing the deletion
 * @returns Object with archivedSecondaryId and deletedFilesCount
 * @throws Error if copy or DB transaction fails
 */
export async function deleteSingleBalise(
  database: Awaited<ReturnType<typeof DatabaseClient.build>>,
  bucketName: string,
  balise: BaliseWithHistory,
  userUid: string,
): Promise<{ archivedSecondaryId: string; deletedFilesCount: number }> {
  const baliseId = balise.secondaryId;
  const archivedSecondaryId = generateArchiveSecondaryId(baliseId);

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

  // Phase 1: Copy files to archive (throws if any copy fails)
  const copiedFiles = await copyFilesToArchive(bucketName, filesToArchive, userUid);

  log.info(`[${userUid}] Successfully copied ${copiedFiles.length} files to archive for balise ${baliseId}`);

  // Phase 2: Archive to database (atomic transaction)
  await database.$transaction(async (tx: Prisma.TransactionClient) => {
    await archiveBaliseInDatabase(tx, balise, archivedSecondaryId, userUid);
  });

  log.info(`[${userUid}] Successfully moved balise ${baliseId} to archive with ${balise.history.length} versions`);

  // Phase 3: Delete original files
  const deleteResults = await deleteOriginalFiles(bucketName, copiedFiles, userUid);

  if (deleteResults.failureCount > 0) {
    log.warn(
      `[${userUid}] Failed to delete ${deleteResults.failureCount} of ${copiedFiles.length} original files for balise ${baliseId}`,
    );
  }

  log.info(
    `[${userUid}] Successfully archived balise ${baliseId} and deleted ${deleteResults.successCount} of ${copiedFiles.length} original S3 files`,
  );

  return {
    archivedSecondaryId,
    deletedFilesCount: deleteResults.successCount,
  };
}
