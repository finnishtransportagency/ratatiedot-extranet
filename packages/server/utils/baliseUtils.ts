import { log } from './logger';
import { DatabaseClient } from '../lambdas/database/client';
import { FileUpload, uploadFilesToS3WithCleanup } from './s3utils';
import { VersionStatus } from '../generated/prisma/client';

const database = await DatabaseClient.build();
const BALISES_BUCKET_NAME = process.env.BALISES_BUCKET_NAME || '';

// Validation constants
export const VALID_EXTENSIONS = ['.il', '.leu', '.bis'];
export const MIN_BALISE_ID = 10000;
export const MAX_BALISE_ID = 99999;

/**
 * Validate file extension
 * Valid extensions: .il, .leu, .bis
 * Case insensitive because Windows and macOS filesystems are case insensitive
 * and users might upload files with uppercase extensions.
 */
export function isValidExtension(filename: string): boolean {
  const lowerFilename = filename.toLowerCase();
  return VALID_EXTENSIONS.some((ext) => lowerFilename.endsWith(ext));
}

/**
 * Validate balise ID range
 * Valid range: 10000-99999
 */
export function isValidBaliseIdRange(baliseId: number): boolean {
  return baliseId >= MIN_BALISE_ID && baliseId <= MAX_BALISE_ID;
}

/**
 * Parse balise ID from filename
 * Examples:
 *   "10000.il" → 10000
 *   "10000.leu" → 10000
 *   "12345.bis" → 12345
 *   "10000K.il" -> 10000
 */
export function parseBaliseIdFromFilename(filename: string): number | null {
  const match = filename.match(/(\d+)/);
  if (!match) return null;
  const id = parseInt(match[1], 10);
  return isNaN(id) ? null : id;
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
    versionStatus: VersionStatus;
    description: string;
    fileTypes: string[];
    createdBy: string;
    createdTime: Date;
    locked: boolean;
    lockedBy?: string | null;
    lockedTime?: Date | null;
    lockedAtVersion?: number | null;
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
  versionStatus: VersionStatus;
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
      versionStatus: existingBalise.versionStatus,
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
 * Uploads files to S3 for a specific balise version
 */
async function uploadFilesToS3(
  files: FileUpload[],
  baliseId: number,
  version: number,
  userId: string,
): Promise<string[]> {
  const pathPrefix = `balise_${baliseId}/v${version}`;
  return await uploadFilesToS3WithCleanup(BALISES_BUCKET_NAME, files, pathPrefix, userId);
}

export interface BaliseValidationFailure {
  baliseId: number;
  errorType: 'not_locked' | 'locked_by_other';
  lockedBy?: string;
  message: string;
}

/**
 * Validates that balises are locked by the specified user
 * Returns ALB error response if validation fails, null if all valid
 */
export async function validateBalisesLockedByUser(
  baliseIds: number[],
  userId: string,
): Promise<{ statusCode: number; headers: { 'Content-Type': string }; body: string } | null> {
  if (baliseIds.length === 0) {
    return null;
  }

  // Fetch all existing balises in one query
  const existingBalises = await database.balise.findMany({
    where: {
      secondaryId: { in: baliseIds },
    },
    select: {
      secondaryId: true,
      locked: true,
      lockedBy: true,
    },
  });

  // Collect all validation failures
  const failures: BaliseValidationFailure[] = [];

  for (const balise of existingBalises) {
    if (!balise.locked) {
      failures.push({
        baliseId: balise.secondaryId,
        errorType: 'not_locked',
        message: `Baliisi ${balise.secondaryId} ei ole lukittu. Lukitse baliisi ennen muokkaamista.`,
      });
    } else if (balise.lockedBy !== userId) {
      failures.push({
        baliseId: balise.secondaryId,
        errorType: 'locked_by_other',
        lockedBy: balise.lockedBy || undefined,
        message: `Baliisi ${balise.secondaryId} on lukittu käyttäjän ${balise.lockedBy} toimesta. Vain lukituksen tehnyt käyttäjä voi muokata baliisia.`,
      });
    }
  }

  if (failures.length > 0) {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: `Lataus epäonnistui ${failures.length} baliisille`,
        errorType: 'validation_failed',
        failures,
      }),
    };
  }

  log.info(
    { userId },
    `Validated ${existingBalises.length} existing balises (${baliseIds.length - existingBalises.length} new) for user ${userId}`,
  );

  return null;
}

interface VersionManagementResult {
  shouldCreateNewVersion: boolean;
  newVersion: number;
}

/**
 * Determines version management strategy based on existing balise and files
 */
function determineVersionManagement(existingBalise: { version: number }, hasFiles: boolean): VersionManagementResult {
  const shouldCreateNewVersion = hasFiles;
  const newVersion = shouldCreateNewVersion ? existingBalise.version + 1 : existingBalise.version;

  return {
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
  log.info({ userId }, `Successfully uploaded ${files.length} files for balise ${baliseId}`);

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
  currentLocked?: boolean,
  currentLockedBy?: string | null,
  currentLockedTime?: Date | null,
  currentLockedAtVersion?: number | null,
) {
  const updateData: {
    fileTypes: string[];
    version?: number;
    versionStatus?: VersionStatus;
    createdBy?: string;
    createdTime?: Date;
    locked?: boolean;
    lockedBy?: string | null;
    lockedTime?: Date | null;
    lockedAtVersion?: number | null;
    description?: string;
  } = {
    fileTypes,
  };

  if (shouldCreateNewVersion) {
    updateData.version = newVersion;
    updateData.createdBy = userId;
    updateData.createdTime = new Date();
    updateData.locked = currentLocked!;
    updateData.lockedBy = currentLockedBy!;
    updateData.lockedTime = currentLockedTime!;
    updateData.lockedAtVersion = currentLockedAtVersion!;
    updateData.versionStatus = VersionStatus.UNCONFIRMED;
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
    versionStatus: VersionStatus;
    description: string;
    fileTypes: string[];
    createdBy: string;
    createdTime: Date;
    locked: boolean;
    lockedBy?: string | null;
    lockedTime?: Date | null;
    lockedAtVersion?: number | null;
  },
  files: FileUpload[],
  description: string | undefined,
  userId: string,
): Promise<BaliseUpdateResult> {
  const versionManagement = determineVersionManagement(existingBalise, files.length > 0);
  const { shouldCreateNewVersion, newVersion } = versionManagement;

  if (shouldCreateNewVersion) {
    // Create version history entry for the OLD version (only if it has content and version > 0)
    if (existingBalise.version > 0) {
      await createVersionHistory(existingBalise);
    }
    log.info({ userId }, `Creating new version ${newVersion} for balise ${existingBalise.secondaryId}`);
  } else {
    log.info(
      { userId },
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
  const updateData = prepareUpdateData(
    fileTypes,
    shouldCreateNewVersion,
    newVersion,
    userId,
    description,
    existingBalise.locked,
    existingBalise.lockedBy,
    existingBalise.lockedTime,
    existingBalise.lockedAtVersion,
  );

  const updatedBalise = await database.balise.update({
    where: { secondaryId: existingBalise.secondaryId },
    data: updateData,
  });

  return {
    newVersion,
    previousVersion: shouldCreateNewVersion ? existingBalise.version : undefined,
    filesUploaded: files.length,
    isNewBalise: false,
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
    log.info({ userId }, `Successfully uploaded ${files.length} files for new balise ${baliseId}`);
  }

  // Create new balise
  const newBalise = await database.balise.create({
    data: {
      secondaryId: baliseId,
      version: newVersion,
      versionStatus: VersionStatus.OFFICIAL,
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
