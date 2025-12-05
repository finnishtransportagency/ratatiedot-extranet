import { ALBEvent, ALBEventHeaders, ALBResult } from 'aws-lambda';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateWriteUser } from '../../utils/userService';
import { base64ToBuffer } from '../alfresco/fileRequestBuilder/alfrescoRequestBuilder';
import busboy, { FileInfo } from 'busboy';
import { Readable } from 'stream';
import { updateOrCreateBalise, createMultipleBalises, getExistingBaliseIds, FileUpload } from '../../utils/baliseUtils';

const MAX_FILES_PER_REQUEST = 1000; // Limit to prevent timeout

interface BulkFileUpload {
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
function groupFilesByBalise(files: BulkFileUpload[]): Map<number, BulkFileUpload[]> {
  const grouped = new Map<number, BulkFileUpload[]>();

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
  files: BulkFileUpload[];
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

    const fileUploads: BulkFileUpload[] = [];
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
    const existingBaliseIds = await getExistingBaliseIds(baliseIds);
    const missingBaliseIds = baliseIds.filter((id) => !existingBaliseIds.has(id));

    // Auto-create missing balises
    if (missingBaliseIds.length > 0) {
      await createMultipleBalises(missingBaliseIds, user.uid, globalDescription, baliseDescriptions);
    }

    // Upload files for each balise
    const results: UploadResult[] = [];
    let hasErrors = false;

    for (const [baliseId, files] of groupedFiles.entries()) {
      const isNewBalise = missingBaliseIds.includes(baliseId);
      const description = baliseDescriptions?.[baliseId] || globalDescription;

      try {
        log.info(user, `Uploading ${files.length} files for balise ${baliseId}`);

        // Convert BulkFileUpload format to FileUpload format (remove baliseId)
        const sharedFiles: FileUpload[] = files.map((file) => ({
          filename: file.filename,
          buffer: file.buffer,
        }));

        const result = await updateOrCreateBalise({
          baliseId,
          files: sharedFiles,
          description,
          userId: user.uid,
        });

        results.push({
          baliseId,
          success: true,
          newVersion: result.newVersion,
          previousVersion: result.previousVersion,
          filesUploaded: result.filesUploaded,
          isNewBalise: result.isNewBalise,
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
      // All failed - use appropriate status code based on error types
      let message = 'Kaikkien tiedostojen lataus epäonnistui';
      let statusCode = 400; // Client error by default

      if (lockedCount === failureCount) {
        message = `${lockedCount} ${
          lockedCount === 1 ? 'baliisi' : 'baliisia'
        } on lukittu. Odota, että lukitukset poistetaan.`;
        statusCode = 409; // Conflict - resource is locked
      } else {
        // Check if there are other error types that warrant 500
        const serverErrors = results.filter(
          (r) => !r.success && r.errorType && ['storage', 'unknown'].includes(r.errorType),
        ).length;
        if (serverErrors > 0) {
          statusCode = 500; // Server error
        }
      }

      return {
        statusCode,
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
