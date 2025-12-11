import { ALBEvent, ALBEventHeaders, ALBResult } from 'aws-lambda';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateWriteUser, RataExtraUser } from '../../utils/userService';
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
 * Create a standardized error response
 */
function createErrorResponse(
  statusCode: number,
  message: string,
  results: UploadResult[],
  invalidFiles: string[],
  success: boolean = false,
): ALBResult {
  const responseBody: {
    success: boolean;
    message: string;
    results: UploadResult[];
    invalidFiles: string[];
  } = {
    success,
    message,
    results,
    invalidFiles,
  };

  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(responseBody),
  };
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
 * Validate request content type
 */
function validateContentType(contentType: string): ALBResult | null {
  if (!contentType.includes('multipart/form-data')) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Content-Type must be multipart/form-data for bulk upload' }),
    };
  }
  return null;
}

/**
 * Validate uploaded files
 */
function validateFiles(fileUploads: BulkFileUpload[], invalidFiles: string[]): ALBResult | null {
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

  if (fileUploads.length > MAX_FILES_PER_REQUEST) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: `Too many files. Maximum allowed: ${MAX_FILES_PER_REQUEST}`,
        totalFiles: fileUploads.length,
      }),
    };
  }

  return null;
}

/**
 * Process files for a single balise
 */
async function processBaliseFiles(
  baliseId: number,
  files: BulkFileUpload[],
  baliseDescriptions: Record<number, string> | undefined,
  globalDescription: string | undefined,
  user: RataExtraUser,
): Promise<UploadResult> {
  const description = baliseDescriptions?.[baliseId] || globalDescription;

  log.info(user, `Uploading ${files.length} files for balise ${baliseId}`);

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

  log.info(
    user,
    `Successfully uploaded ${result.filesUploaded} files to balise ${baliseId}, version ${result.newVersion}`,
  );

  return {
    baliseId,
    success: true,
    newVersion: result.newVersion,
    previousVersion: result.previousVersion,
    filesUploaded: result.filesUploaded,
    isNewBalise: result.isNewBalise,
  };
}

/**
 * Handle errors during balise processing
 */
function handleProcessingError(baliseId: number, error: unknown, user: RataExtraUser): UploadResult {
  let errorType: UploadResult['errorType'] = 'unknown';
  let message = 'Tuntematon virhe';
  let lockedBy: string | undefined;

  const errorMessage = error instanceof Error ? error.message : 'Unknown error';

  if (errorMessage.includes('locked')) {
    errorType = 'locked';
    message = errorMessage;
    const lockedByMatch = errorMessage.match(/lukittu käyttäjän (.+) toimesta/);
    if (lockedByMatch) {
      lockedBy = lockedByMatch[1];
    }
  } else if (errorMessage.includes('not found') || errorMessage.includes('ei löytynyt')) {
    errorType = 'not_found';
    message = errorMessage;
  } else if (errorMessage.includes('storage') || errorMessage.includes('S3')) {
    errorType = 'storage';
    message = 'Tiedoston tallennus epäonnistui';
  } else if (errorMessage.includes('permission') || errorMessage.includes('käyttöoikeus')) {
    errorType = 'permission';
    message = errorMessage;
  }

  log.error(user, `Error processing balise ${baliseId}: ${errorMessage}`, error);

  return {
    baliseId,
    success: false,
    error: message,
    errorType,
    lockedBy,
  };
}

/**
 * Process all balise files and return results
 */
async function processAllBalises(
  groupedFiles: Map<number, BulkFileUpload[]>,
  baliseDescriptions: Record<number, string> | undefined,
  globalDescription: string | undefined,
  user: RataExtraUser,
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (const [baliseId, files] of groupedFiles) {
    try {
      const result = await processBaliseFiles(baliseId, files, baliseDescriptions, globalDescription, user);
      results.push(result);
    } catch (error) {
      const errorResult = handleProcessingError(baliseId, error, user);
      results.push(errorResult);
    }
  }

  return results;
}

/**
 * Determines the appropriate HTTP response based on processing results
 */
function determineResponse(
  results: UploadResult[],
  invalidFiles: string[],
  fileUploads: BulkFileUpload[],
  groupedFiles: Map<number, BulkFileUpload[]>,
): ALBResult {
  const hasErrors = results.some((r) => !r.success);

  // Determine response status
  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;
  const lockedCount = results.filter((r) => r.errorType === 'locked').length;

  // All succeeded
  if (!hasErrors) {
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

  // Partial success
  if (successCount > 0) {
    const message = `Tiedostojen päivitys: ${successCount} onnistui, ${failureCount} epäonnistui`;
    return createErrorResponse(207, message, results, invalidFiles);
  }

  // All failures are due to locked balises
  if (lockedCount === failureCount) {
    const message = `${lockedCount} ${
      lockedCount === 1 ? 'baliisi' : 'baliisia'
    } on lukittu. Odota, että lukitukset poistetaan.`;
    return createErrorResponse(409, message, results, invalidFiles);
  }

  // Check if there are server errors that warrant 500
  const serverErrors = results.filter(
    (r) => !r.success && r.errorType && ['storage', 'unknown'].includes(r.errorType),
  ).length;

  if (serverErrors > 0) {
    return createErrorResponse(500, 'Kaikkien tiedostojen lataus epäonnistui', results, invalidFiles);
  }

  // Default client error for all other failure cases
  return createErrorResponse(400, 'Kaikkien tiedostojen lataus epäonnistui', results, invalidFiles);
}

/**
 * Main handler for bulk upload
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    validateWriteUser(user, '');

    log.info(user, `Bulk upload balises request. Path: ${event.path}`);

    // Validate content type
    const contentType = event.headers?.['content-type'] || event.headers?.['Content-Type'] || '';
    const contentTypeError = validateContentType(contentType);
    if (contentTypeError) return contentTypeError;

    // Parse multipart form data
    const buffer = event.isBase64Encoded
      ? base64ToBuffer(event.body as string)
      : Buffer.from(event.body || '', 'utf-8');
    const {
      files: fileUploads,
      invalidFiles,
      globalDescription,
      baliseDescriptions,
    } = await parseMultipartForm(buffer, event.headers as ALBEventHeaders);

    // Validate files
    const fileValidationError = validateFiles(fileUploads, invalidFiles);
    if (fileValidationError) return fileValidationError;

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

    // Process all balises
    const results = await processAllBalises(groupedFiles, baliseDescriptions, globalDescription, user);

    // Determine appropriate response based on results
    return determineResponse(results, invalidFiles, fileUploads, groupedFiles);
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
