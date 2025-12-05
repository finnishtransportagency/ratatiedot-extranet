import { log } from './logger';
import { DatabaseClient } from '../lambdas/database/client';
import { uploadToS3 } from './s3utils';

const database = await DatabaseClient.build();
const BALISES_BUCKET_NAME = process.env.BALISES_BUCKET_NAME || '';

export interface FileUpload {
  filename: string;
  buffer: Buffer;
}

export interface BaliseUpdateResult {
  newVersion: number;
  previousVersion?: number;
  filesUploaded: number;
  isNewBalise: boolean;
  balise: {
    id: string;
    secondaryId: number;
    version: number;
    description: string;
    fileTypes: string[];
    createdBy: string;
    createdTime: Date;
    locked: boolean;
    lockedBy?: string | null;
    lockedTime?: Date | null;
  };
}

export interface BaliseUpdateOptions {
  baliseId: number;
  files?: FileUpload[];
  description?: string;
  userId: string;
}

/**
 * Creates version history entry for existing balise version
 */
async function createVersionHistory(existingBalise: {
  id: string;
  secondaryId: number;
  version: number;
  description: string;
  fileTypes: string[];
  createdBy: string;
  createdTime: Date;
  locked: boolean;
  lockedBy?: string | null;
  lockedTime?: Date | null;
}): Promise<void> {
  await database.baliseVersion.create({
    data: {
      baliseId: existingBalise.id,
      secondaryId: existingBalise.secondaryId,
      version: existingBalise.version,
      description: existingBalise.description,
      fileTypes: existingBalise.fileTypes,
      createdBy: existingBalise.createdBy,
      createdTime: existingBalise.createdTime,
      locked: existingBalise.locked,
      lockedBy: existingBalise.lockedBy,
      lockedTime: existingBalise.lockedTime,
    },
  });
}

/**
 * Uploads files to S3 with consistent path structure
 */
async function uploadFilesToS3(
  files: FileUpload[],
  baliseId: number,
  version: number,
  userId: string,
): Promise<string[]> {
  const uploadPromises = files.map(async (file) => {
    const s3Key = `balise_${baliseId}/v${version}/${file.filename}`;
    await uploadToS3(BALISES_BUCKET_NAME, s3Key, file.buffer);
    log.info(userId, `Uploaded file to S3: ${s3Key}`);
    return file.filename;
  });

  return await Promise.all(uploadPromises);
}

/**
 * Checks if a balise is locked by another user
 */

// TODO Lock functionality will be modified later, this works as is for now but lock requirements work incorrectly
function validateBaliseNotLocked(
  balise: { secondaryId: number; locked: boolean; lockedBy?: string | null },
  userId: string,
): void {
  if (balise.locked && balise.lockedBy !== userId) {
    const error: Error & { errorType?: string; lockedBy?: string } = new Error(
      `Baliisi ${balise.secondaryId} on lukittu käyttäjän ${balise.lockedBy} toimesta. Odota, että lukitus poistetaan.`,
    );
    error.errorType = 'locked';
    error.lockedBy = balise.lockedBy || undefined;
    throw error;
  }
}

/**
 * Updates or creates a balise with file uploads and version management
 * Handles both single balise updates and bulk operations
 */
export async function updateOrCreateBalise(options: BaliseUpdateOptions): Promise<BaliseUpdateResult> {
  const { baliseId, files = [], description, userId } = options;

  // Check if balise exists
  const existingBalise = await database.balise.findUnique({
    where: { secondaryId: baliseId },
  });

  if (existingBalise) {
    // Updating existing balise
    validateBaliseNotLocked(existingBalise, userId);

    // Determine if this is effectively a new balise (version 0 getting its first files)
    const isEffectivelyNew = existingBalise.version === 0 && files.length > 0;

    // Determine if we should create a new version (only when files are uploaded)
    const shouldCreateNewVersion = files.length > 0;
    let newVersion = existingBalise.version;

    if (shouldCreateNewVersion) {
      // Create version history entry for the OLD version (only if it has content and version > 0)
      if (existingBalise.version > 0) {
        await createVersionHistory(existingBalise);
      }

      newVersion = existingBalise.version + 1;
      log.info(userId, `Creating new version ${newVersion} for balise ${baliseId}`);
    } else {
      log.info(userId, `Updating existing version ${newVersion} for balise ${baliseId} (metadata only)`);
    }

    // Handle file uploads
    let fileTypes = existingBalise.fileTypes;
    if (files.length > 0) {
      const uploadedFilenames = await uploadFilesToS3(files, baliseId, newVersion, userId);
      fileTypes = shouldCreateNewVersion ? uploadedFilenames : [...fileTypes, ...uploadedFilenames];
      log.info(userId, `Successfully uploaded ${files.length} files for balise ${baliseId}`);
    }

    // Prepare update data
    const updateData: {
      fileTypes: string[];
      version?: number;
      createdBy?: string;
      createdTime?: Date;
      locked?: boolean;
      lockedBy?: string | null;
      lockedTime?: Date | null;
      description?: string;
    } = {
      fileTypes,
    };

    if (shouldCreateNewVersion) {
      updateData.version = newVersion;
      updateData.createdBy = userId;
      updateData.createdTime = new Date();
      updateData.locked = false;
      updateData.lockedBy = null;
      updateData.lockedTime = null;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    // Update balise record
    const updatedBalise = await database.balise.update({
      where: { secondaryId: baliseId },
      data: updateData,
    });

    return {
      newVersion,
      previousVersion: isEffectivelyNew ? undefined : existingBalise.version,
      filesUploaded: files.length,
      isNewBalise: isEffectivelyNew,
      balise: updatedBalise,
    };
  } else {
    // Creating new balise
    const newVersion = 1;
    let fileTypes: string[] = [];

    // Upload files if provided
    if (files.length > 0) {
      fileTypes = await uploadFilesToS3(files, baliseId, newVersion, userId);
      log.info(userId, `Successfully uploaded ${files.length} files for new balise ${baliseId}`);
    }

    // Create new balise
    const newBalise = await database.balise.create({
      data: {
        secondaryId: baliseId,
        version: newVersion,
        description: description || '',
        fileTypes,
        createdBy: userId,
        createdTime: new Date(),
        locked: false,
      },
    });

    return {
      newVersion,
      previousVersion: undefined,
      filesUploaded: files.length,
      isNewBalise: true,
      balise: newBalise,
    };
  }
}

/**
 * Creates multiple balises in a batch operation
 */
export async function createMultipleBalises(
  baliseIds: number[],
  userId: string,
  globalDescription?: string,
  baliseDescriptions?: Record<number, string>,
): Promise<void> {
  if (baliseIds.length === 0) return;

  await database.balise.createMany({
    data: baliseIds.map((secondaryId) => ({
      secondaryId,
      version: 0, // Will become 1 after first upload
      description: baliseDescriptions?.[secondaryId] || globalDescription || `Luotu automaattisesti massalatauksessa`,
      fileTypes: [],
      createdBy: userId,
      locked: false,
    })),
  });

  log.info(userId, `Auto-created ${baliseIds.length} missing balise(s): ${baliseIds.join(', ')}`);
}

/**
 * Gets existing balise IDs from a list
 */
export async function getExistingBaliseIds(baliseIds: number[]): Promise<Set<number>> {
  const existingBalises = await database.balise.findMany({
    where: {
      secondaryId: { in: baliseIds },
    },
    select: { secondaryId: true },
  });

  return new Set(existingBalises.map((b) => b.secondaryId));
}
