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

interface VersionManagementResult {
  shouldCreateNewVersion: boolean;
  newVersion: number;
  isEffectivelyNew: boolean;
}

/**
 * Determines version management strategy based on existing balise and files
 */
function determineVersionManagement(existingBalise: { version: number }, hasFiles: boolean): VersionManagementResult {
  const isEffectivelyNew = existingBalise.version === 0 && hasFiles;
  const shouldCreateNewVersion = hasFiles;
  const newVersion = shouldCreateNewVersion ? existingBalise.version + 1 : existingBalise.version;

  return {
    isEffectivelyNew,
    shouldCreateNewVersion,
    newVersion,
  };
}

/**
 * Handles file type management for balise updates
 */
async function handleFileTypeUpdate(
  files: FileUpload[],
  existingFileTypes: string[],
  baliseId: number,
  version: number,
  userId: string,
  shouldCreateNewVersion: boolean,
): Promise<string[]> {
  if (files.length === 0) {
    return existingFileTypes;
  }

  const uploadedFilenames = await uploadFilesToS3(files, baliseId, version, userId);
  log.info(userId, `Successfully uploaded ${files.length} files for balise ${baliseId}`);

  return shouldCreateNewVersion ? uploadedFilenames : [...existingFileTypes, ...uploadedFilenames];
}

/**
 * Prepares update data for existing balise
 */
function prepareUpdateData(
  fileTypes: string[],
  shouldCreateNewVersion: boolean,
  newVersion: number,
  userId: string,
  description?: string,
) {
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

  return updateData;
}

/**
 * Updates an existing balise with new files and/or metadata
 */
async function updateExistingBalise(
  existingBalise: {
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
  },
  files: FileUpload[],
  description: string | undefined,
  userId: string,
): Promise<BaliseUpdateResult> {
  validateBaliseNotLocked(existingBalise, userId);

  const versionManagement = determineVersionManagement(existingBalise, files.length > 0);
  const { shouldCreateNewVersion, newVersion, isEffectivelyNew } = versionManagement;

  if (shouldCreateNewVersion) {
    // Create version history entry for the OLD version (only if it has content and version > 0)
    if (existingBalise.version > 0) {
      await createVersionHistory(existingBalise);
    }
    log.info(userId, `Creating new version ${newVersion} for balise ${existingBalise.secondaryId}`);
  } else {
    log.info(
      userId,
      `Updating existing version ${newVersion} for balise ${existingBalise.secondaryId} (metadata only)`,
    );
  }

  // Handle file uploads and type management
  const fileTypes = await handleFileTypeUpdate(
    files,
    existingBalise.fileTypes,
    existingBalise.secondaryId,
    newVersion,
    userId,
    shouldCreateNewVersion,
  );

  // Prepare and apply update
  const updateData = prepareUpdateData(fileTypes, shouldCreateNewVersion, newVersion, userId, description);

  const updatedBalise = await database.balise.update({
    where: { secondaryId: existingBalise.secondaryId },
    data: updateData,
  });

  return {
    newVersion,
    previousVersion: isEffectivelyNew ? undefined : existingBalise.version,
    filesUploaded: files.length,
    isNewBalise: isEffectivelyNew,
    balise: updatedBalise,
  };
}

/**
 * Creates a new balise with optional files
 */
async function createNewBalise(
  baliseId: number,
  files: FileUpload[],
  description: string | undefined,
  userId: string,
): Promise<BaliseUpdateResult> {
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
    return await updateExistingBalise(existingBalise, files, description, userId);
  } else {
    return await createNewBalise(baliseId, files, description, userId);
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

  return new Set(existingBalises.map((b: { secondaryId: number }) => b.secondaryId));
}
