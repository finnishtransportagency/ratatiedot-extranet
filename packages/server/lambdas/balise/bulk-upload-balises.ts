import { ALBEvent, ALBEventHeaders, ALBResult } from 'aws-lambda';
import { log } from '../../utils/logger';
import { getUser, validateBaliseWriteUser, RataExtraUser } from '../../utils/userService';
import { base64ToBuffer } from '../alfresco/fileRequestBuilder/alfrescoRequestBuilder';
import busboy, { FileInfo } from 'busboy';
import { Readable } from 'stream';
import {
  updateOrCreateBalise,
  validateBalisesLockedByUser,
  VALID_EXTENSIONS,
  MIN_BALISE_ID,
  MAX_BALISE_ID,
  isValidExtension,
  isValidBaliseIdRange,
  parseBaliseIdFromFilename,
  isValidFilenameFormat,
} from '../../utils/balise/baliseUtils';
import type { FileUpload } from '../../utils/s3utils';
import { getRataExtraLambdaError } from '../../utils/errors';

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
  isNewBalise?: boolean; // true if balise was created, false if updated
  error?: string;
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

        // Validate filename format first (includes K-only suffix and extension check)
        if (!isValidFilenameFormat(fileinfo.filename)) {
          if (!isValidExtension(fileinfo.filename)) {
            invalidFiles.push(
              `${fileinfo.filename} (virheellinen tiedostopääte, sallitut: ${VALID_EXTENSIONS.join(', ')})`,
            );
            log.warn({ system: true }, `Invalid file extension: ${fileinfo.filename}`);
          } else {
            invalidFiles.push(
              `${fileinfo.filename} (virheellinen tiedostonimi, sallittu muoto: {ID}.pääte tai {ID}K.pääte)`,
            );
            log.warn({ system: true }, `Invalid filename format: ${fileinfo.filename}`);
          }
          return;
        }

        const baliseId = parseBaliseIdFromFilename(fileinfo.filename);
        if (baliseId === null) {
          invalidFiles.push(`${fileinfo.filename} (baliisi-tunnusta ei löydy tiedostonimestä)`);
          log.warn({ system: true }, `Cannot parse balise ID from filename: ${fileinfo.filename}`);
          return;
        }

        // Validate balise ID range
        if (!isValidBaliseIdRange(baliseId)) {
          invalidFiles.push(
            `${fileinfo.filename} (baliisi-tunnus ${baliseId} ei ole välillä ${MIN_BALISE_ID}-${MAX_BALISE_ID})`,
          );
          log.warn({ system: true }, `Balise ID out of range: ${baliseId} in filename ${fileinfo.filename}`);
          return;
        }

        fileUploads.push({
          filename: fileinfo.filename,
          buffer: fileBuffer,
          baliseId,
        });
        log.debug(`Parsed file: ${fileinfo.filename} -> balise ${baliseId}, size: ${fileBuffer.length} bytes`);
      });

      file.on('error', (err) => {
        log.error({ system: true }, `Error reading file ${fileinfo.filename}: ${err.message}`);
      });
    });

    bb.on('finish', () => {
      log.info({ system: true }, `Parsed ${fileUploads.length} valid files, ${invalidFiles.length} invalid files`);
      resolve({ files: fileUploads, invalidFiles, globalDescription, baliseDescriptions });
    });

    bb.on('error', (err: Error) => {
      log.error({ system: true }, `Busboy error: ${err.message}`);
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
        hint: `Tiedostonimen tulee sisältää baliisi-tunnus (${MIN_BALISE_ID}-${MAX_BALISE_ID}) ja pääte tulee olla ${VALID_EXTENSIONS.join(', ')} (esim. 10000.il)`,
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
  const description = baliseDescriptions?.[baliseId] ?? globalDescription;

  if (description === undefined || description === null || String(description).trim() === '') {
    return {
      baliseId,
      success: false,
      error: `Puuttuva kuvaus baliisille ${baliseId}`,
    };
  }

  log.info(user, `Uploading ${files.length} files for balise ${baliseId}`);

  const sharedFiles: FileUpload[] = files.map((file) => ({
    filename: file.filename,
    buffer: file.buffer,
  }));

  try {
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
  } catch (error) {
    log.error(user, `Failed to upload balise ${baliseId}: ${error}`);
    return {
      baliseId,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process all balise files with concurrency control
 */
async function processAllBalises(
  groupedFiles: Map<number, BulkFileUpload[]>,
  baliseDescriptions: Record<number, string> | undefined,
  globalDescription: string | undefined,
  user: RataExtraUser,
): Promise<UploadResult[]> {
  const CONCURRENCY_LIMIT = 10;
  const entries = Array.from(groupedFiles);
  const results: UploadResult[] = [];

  log.info(user, `Processing ${entries.length} balises with concurrency limit of ${CONCURRENCY_LIMIT}`);

  for (let i = 0; i < entries.length; i += CONCURRENCY_LIMIT) {
    const chunk = entries.slice(i, i + CONCURRENCY_LIMIT);
    const chunkResults = await Promise.all(
      chunk.map(([baliseId, files]) =>
        processBaliseFiles(baliseId, files, baliseDescriptions, globalDescription, user),
      ),
    );
    results.push(...chunkResults);
  }

  return results;
}

/**
 * Main handler for bulk upload
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);

    validateBaliseWriteUser(user);

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

    const baliseIds = Array.from(groupedFiles.keys());
    const lockValidationError = await validateBalisesLockedByUser(baliseIds, user.uid);
    if (lockValidationError) return lockValidationError;

    const results = await processAllBalises(groupedFiles, baliseDescriptions, globalDescription, user);

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;
    const allSucceeded = failureCount === 0;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: allSucceeded,
        message: allSucceeded
          ? `Tiedostot ladattu onnistuneesti ${results.length} baliisiin`
          : `Lataus valmis: ${successCount} onnistui, ${failureCount} epäonnistui`,
        results,
        invalidFiles,
        totalFiles: fileUploads.length,
        totalBalises: groupedFiles.size,
        successCount,
        failureCount,
      }),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
