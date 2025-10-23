import { ALBEvent, ALBEventHeaders, ALBResult } from 'aws-lambda';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { uploadToS3 } from '../../utils/s3utils';
import { base64ToBuffer } from '../alfresco/fileRequestBuilder/alfrescoRequestBuilder';
import busboy, { FileInfo } from 'busboy';
import { Readable } from 'stream';

const database = await DatabaseClient.build();
const BALISES_BUCKET_NAME = process.env.BALISES_BUCKET_NAME || '';
const MAX_FILES_PER_REQUEST = 1000; // Limit to prevent timeout

interface FileUpload {
  filename: string;
  buffer: Buffer;
  baliseId: number;
}

interface UploadResult {
  baliseId: number;
  success: boolean;
  newVersion?: number;
  previousVersion?: number; // undefined for new balises
  filesUploaded?: number;
  error?: string;
  errorType?: 'locked' | 'not_found' | 'permission' | 'storage' | 'unknown';
  lockedBy?: string;
  isNewBalise?: boolean; // true if balise was created, false if updated
}

/**
 * Parse balise ID from filename
 * Examples:
 *   "10000.il" → 10000
 *   "10000.leu" → 10000
 *   "A-12345.pdf" → 12345
 */
function parseBaliseId(filename: string): number | null {
  // Extract the first continuous sequence of digits
  const match = filename.match(/(\d+)/);
  if (!match) {
    return null;
  }
  const id = parseInt(match[1], 10);
  return isNaN(id) ? null : id;
}

/**
 * Group files by balise ID based on filename parsing
 */
function groupFilesByBalise(files: FileUpload[]): Map<number, FileUpload[]> {
  const grouped = new Map<number, FileUpload[]>();

  for (const file of files) {
    const baliseId = file.baliseId;
    if (!grouped.has(baliseId)) {
      grouped.set(baliseId, []);
    }
    grouped.get(baliseId)!.push(file);
  }

  return grouped;
}

/**
 * Parse multipart form data with multiple files and optional metadata
 */
async function parseMultipartForm(
  buffer: Buffer | string,
  headers: ALBEventHeaders,
): Promise<{
  files: FileUpload[];
  invalidFiles: string[];
  globalDescription?: string;
  baliseDescriptions?: Record<number, string>;
}> {
  return new Promise((resolve, reject) => {
    const bb = busboy({
      headers: {
        ...headers,
        'content-type': headers['Content-Type'] || headers['content-type'],
      },
    });

    const fileUploads: FileUpload[] = [];
    const invalidFiles: string[] = [];
    let globalDescription: string | undefined;
    const baliseDescriptions: Record<number, string> = {};

    bb.on('field', (fieldname: string, value: string) => {
      if (fieldname === 'globalDescription') {
        globalDescription = value;
      } else if (fieldname.startsWith('description_')) {
        const baliseId = parseInt(fieldname.replace('description_', ''), 10);
        if (!isNaN(baliseId)) {
          baliseDescriptions[baliseId] = value;
        }
      }
    });

    bb.on('file', (_fieldname: string, file: Readable, fileinfo: FileInfo) => {
      const chunks: Buffer[] = [];
      // Convert the filename to utf-8 since latin1 preserves individual bytes
      fileinfo.filename = Buffer.from(fileinfo.filename, 'latin1').toString('utf8');

      file.on('data', (data: Buffer) => {
        chunks.push(data);
      });

      file.on('end', () => {
        const fileBuffer = Buffer.concat(chunks as unknown as Uint8Array[]);
        const baliseId = parseBaliseId(fileinfo.filename);

        if (baliseId === null) {
          invalidFiles.push(fileinfo.filename);
          log.warn('system', `Cannot parse balise ID from filename: ${fileinfo.filename}`);
        } else {
          fileUploads.push({
            filename: fileinfo.filename,
            buffer: fileBuffer,
            baliseId,
          });
          log.debug(`Parsed file: ${fileinfo.filename} -> balise ${baliseId}, size: ${fileBuffer.length} bytes`);
        }
      });

      file.on('error', (err) => {
        log.error('system', `Error reading file ${fileinfo.filename}: ${err.message}`);
      });
    });

    bb.on('finish', () => {
      log.info('system', `Parsed ${fileUploads.length} valid files, ${invalidFiles.length} invalid files`);
      resolve({ files: fileUploads, invalidFiles, globalDescription, baliseDescriptions });
    });

    bb.on('error', (err: Error) => {
      log.error('system', `Busboy error: ${err.message}`);
      reject(err);
    });

    bb.end(buffer);
  });
}

/**
 * Upload files for a single balise (creates new version)
 */
async function uploadFilesForBalise(
  baliseId: number,
  files: FileUpload[],
  userId: string,
  description?: string,
): Promise<{ newVersion: number; previousVersion: number; filesUploaded: number }> {
  // 1. Get current balise
  const existingBalise = await database.balise.findUnique({
    where: { secondaryId: baliseId },
  });

  if (!existingBalise) {
    throw new Error(`Balise ${baliseId} not found`);
  }

  const previousVersion = existingBalise.version;

  // 2. Check if locked
  if (existingBalise.locked && existingBalise.lockedBy !== userId) {
    const error: Error & { errorType?: string; lockedBy?: string } = new Error(
      `Baliisi ${baliseId} on lukittu käyttäjän ${existingBalise.lockedBy} toimesta. Odota, että lukitus poistetaan.`,
    );
    error.errorType = 'locked';
    error.lockedBy = existingBalise.lockedBy || undefined;
    throw error;
  }

  // 3. Create version history entry for the OLD version
  await database.baliseVersion.create({
    data: {
      baliseId: existingBalise.id,
      secondaryId: existingBalise.secondaryId,
      version: existingBalise.version,
      description: existingBalise.description,
      bucketId: existingBalise.bucketId,
      fileTypes: existingBalise.fileTypes,
      createdBy: existingBalise.createdBy,
      createdTime: existingBalise.createdTime,
      locked: existingBalise.locked,
      lockedBy: existingBalise.lockedBy,
      lockedTime: existingBalise.lockedTime,
    },
  });

  // 4. Increment version
  const newVersion = existingBalise.version + 1;

  // 5. Upload all files to S3
  const uploadPromises = files.map(async (file) => {
    const s3Key = `balise_${baliseId}/v${newVersion}/${file.filename}`;
    await uploadToS3(BALISES_BUCKET_NAME, s3Key, file.buffer);
    return file.filename;
  });

  const uploadedFilenames = await Promise.all(uploadPromises);

  // 6. Update balise record with new version and file list
  await database.balise.update({
    where: { secondaryId: baliseId },
    data: {
      version: newVersion,
      fileTypes: uploadedFilenames,
      description: description || existingBalise.description, // Use provided description or keep existing
      createdBy: userId,
      createdTime: new Date(),
      locked: false,
      lockedBy: null,
      lockedTime: null,
    },
  });

  return {
    newVersion,
    previousVersion,
    filesUploaded: uploadedFilenames.length,
  };
}

/**
 * Main handler for bulk upload
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    validateWriteUser(user, '');

    log.info(user, `Bulk upload balises request. Path: ${event.path}`);

    // Check if this is a file upload (multipart/form-data)
    const contentType = event.headers?.['content-type'] || event.headers?.['Content-Type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Content-Type must be multipart/form-data for bulk upload' }),
      };
    }

    // Parse multipart form data with multiple files
    const buffer = event.isBase64Encoded
      ? base64ToBuffer(event.body as string)
      : Buffer.from(event.body || '', 'utf-8');
    const {
      files: fileUploads,
      invalidFiles,
      globalDescription,
      baliseDescriptions,
    } = await parseMultipartForm(buffer, event.headers as ALBEventHeaders);

    if (fileUploads.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'No valid files found in upload',
          hint: 'Check that filenames contain balise IDs (e.g., 10000.il)',
          invalidFiles,
        }),
      };
    }

    // Check file count limit
    if (fileUploads.length > MAX_FILES_PER_REQUEST) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: `Too many files. Maximum ${MAX_FILES_PER_REQUEST} files per request.`,
          filesReceived: fileUploads.length,
          hint: `Split your upload into multiple batches of max ${MAX_FILES_PER_REQUEST} files.`,
        }),
      };
    }

    // Group files by balise ID
    const groupedFiles = groupFilesByBalise(fileUploads);
    log.info(user, `Grouped ${fileUploads.length} files into ${groupedFiles.size} balise(s)`);

    // Validate all balises exist - create missing ones automatically
    const baliseIds = Array.from(groupedFiles.keys());
    const existingBalises = await database.balise.findMany({
      where: {
        secondaryId: { in: baliseIds },
      },
      select: { secondaryId: true },
    });

    const existingBaliseIds = new Set(existingBalises.map((b) => b.secondaryId));
    const missingBaliseIds = baliseIds.filter((id) => !existingBaliseIds.has(id));

    // Auto-create missing balises
    if (missingBaliseIds.length > 0) {
      log.info(user, `Auto-creating ${missingBaliseIds.length} missing balise(s): ${missingBaliseIds.join(', ')}`);

      await database.balise.createMany({
        data: missingBaliseIds.map((secondaryId) => ({
          secondaryId,
          version: 0, // Will become 1 after first upload
          description: baliseDescriptions?.[secondaryId] || globalDescription || `Auto-created during bulk upload`,
          bucketId: BALISES_BUCKET_NAME,
          fileTypes: [],
          createdBy: user.uid,
          locked: false,
        })),
      });
    }

    // Upload files for each balise
    const results: UploadResult[] = [];
    let hasErrors = false;

    for (const [baliseId, files] of groupedFiles.entries()) {
      const isNewBalise = missingBaliseIds.includes(baliseId);
      const description = baliseDescriptions?.[baliseId] || globalDescription;

      try {
        log.info(user, `Uploading ${files.length} files for balise ${baliseId}`);
        const result = await uploadFilesForBalise(baliseId, files, user.uid, description);

        results.push({
          baliseId,
          success: true,
          newVersion: result.newVersion,
          previousVersion: result.previousVersion,
          filesUploaded: result.filesUploaded,
          isNewBalise,
        });

        log.info(
          user,
          `Successfully uploaded ${result.filesUploaded} files to balise ${baliseId}, version ${result.newVersion}`,
        );
      } catch (err) {
        hasErrors = true;
        const error = err as Error & { errorType?: string; lockedBy?: string };
        const errorMessage = error.message || 'Unknown error';
        const errorType = (error.errorType || 'unknown') as
          | 'locked'
          | 'not_found'
          | 'permission'
          | 'storage'
          | 'unknown';
        const lockedBy = error.lockedBy;

        // Create user-friendly error message
        let userMessage = errorMessage;
        if (errorType === 'locked') {
          userMessage = `Baliisi on lukittu${
            lockedBy ? ` käyttäjän ${lockedBy} toimesta` : ''
          }. Odota, että lukitus poistetaan.`;
        } else if (errorType === 'permission') {
          userMessage = 'Sinulla ei ole oikeuksia muokata tätä baliisia.';
        } else if (errorType === 'storage') {
          userMessage = 'Tiedostojen tallennus epäonnistui. Yritä uudelleen.';
        } else if (errorType === 'not_found') {
          userMessage = 'Baliisia ei löytynyt järjestelmästä.';
        }

        results.push({
          baliseId,
          success: false,
          error: userMessage,
          errorType,
          lockedBy,
          isNewBalise,
        });

        log.error(`Failed to upload files for balise ${baliseId}: ${errorMessage} (type: ${errorType})`);
      }
    }

    // Determine response status
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;
    const lockedCount = results.filter((r) => r.errorType === 'locked').length;

    if (hasErrors && successCount === 0) {
      // All failed
      let message = 'Kaikkien tiedostojen lataus epäonnistui';
      if (lockedCount === failureCount) {
        message = `${lockedCount} baliisia on lukittu. Odota, että lukitukset poistetaan.`;
      }

      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message,
          results,
          invalidFiles,
        }),
      };
    } else if (hasErrors) {
      // Partial success
      let message = `Tiedostojen päivitys: ${successCount} onnistui, ${failureCount} epäonnistui`;
      if (lockedCount > 0) {
        message += ` (${lockedCount} lukittua)`;
      }

      return {
        statusCode: 207, // Multi-Status
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message,
          results,
          invalidFiles,
        }),
      };
    } else {
      // All succeeded
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: `Tiedostot ladattu onnistuneesti ${successCount} baliisiin`,
          results,
          invalidFiles,
          totalFiles: fileUploads.length,
          totalBalises: groupedFiles.size,
        }),
      };
    }
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
