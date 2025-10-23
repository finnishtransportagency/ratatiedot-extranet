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
  filesUploaded?: number;
  error?: string;
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
 * Parse multipart form data with multiple files
 */
async function parseMultipartForm(
  buffer: Buffer | string,
  headers: ALBEventHeaders,
): Promise<{ files: FileUpload[]; invalidFiles: string[] }> {
  return new Promise((resolve, reject) => {
    const bb = busboy({
      headers: {
        ...headers,
        'content-type': headers['Content-Type'] || headers['content-type'],
      },
    });

    const fileUploads: FileUpload[] = [];
    const invalidFiles: string[] = [];

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
      resolve({ files: fileUploads, invalidFiles });
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
): Promise<{ newVersion: number; filesUploaded: number }> {
  // 1. Get current balise
  const existingBalise = await database.balise.findUnique({
    where: { secondaryId: baliseId },
  });

  if (!existingBalise) {
    throw new Error(`Balise ${baliseId} not found`);
  }

  // 2. Check if locked
  if (existingBalise.locked && existingBalise.lockedBy !== userId) {
    throw new Error(
      `Balise ${baliseId} is locked by ${existingBalise.lockedBy}. Cannot upload files to a locked balise.`,
    );
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
      createdBy: userId,
      createdTime: new Date(),
      locked: false,
      lockedBy: null,
      lockedTime: null,
    },
  });

  return {
    newVersion,
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
    const { files: fileUploads, invalidFiles } = await parseMultipartForm(buffer, event.headers as ALBEventHeaders);

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

    // Validate all balises exist before starting uploads
    const baliseIds = Array.from(groupedFiles.keys());
    const existingBalises = await database.balise.findMany({
      where: {
        secondaryId: { in: baliseIds },
      },
      select: { secondaryId: true },
    });

    const existingBaliseIds = new Set(existingBalises.map((b) => b.secondaryId));
    const missingBaliseIds = baliseIds.filter((id) => !existingBaliseIds.has(id));

    if (missingBaliseIds.length > 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Some balises do not exist',
          missingBalises: missingBaliseIds,
          hint: 'All balises must exist before bulk upload. Create missing balises first.',
        }),
      };
    }

    // Upload files for each balise (transaction-like: all or nothing)
    const results: UploadResult[] = [];
    let hasErrors = false;

    for (const [baliseId, files] of groupedFiles.entries()) {
      try {
        log.info(user, `Uploading ${files.length} files for balise ${baliseId}`);
        const result = await uploadFilesForBalise(baliseId, files, user.uid);

        results.push({
          baliseId,
          success: true,
          newVersion: result.newVersion,
          filesUploaded: result.filesUploaded,
        });

        log.info(
          user,
          `Successfully uploaded ${result.filesUploaded} files to balise ${baliseId}, version ${result.newVersion}`,
        );
      } catch (err) {
        hasErrors = true;
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';

        results.push({
          baliseId,
          success: false,
          error: errorMessage,
        });

        log.error(`Failed to upload files for balise ${baliseId}: ${errorMessage}`);
      }
    }

    // Determine response status
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    if (hasErrors && successCount === 0) {
      // All failed
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'All uploads failed',
          results,
          invalidFiles,
        }),
      };
    } else if (hasErrors) {
      // Partial success
      return {
        statusCode: 207, // Multi-Status
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: `Partial success: ${successCount} succeeded, ${failureCount} failed`,
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
          message: `Successfully uploaded files to ${successCount} balise(s)`,
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
