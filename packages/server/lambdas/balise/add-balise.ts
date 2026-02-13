import { ALBEvent, ALBEventHeaders, ALBResult } from 'aws-lambda';
import { log } from '../../utils/logger';
import { getUser, validateBaliseWriteUser } from '../../utils/userService';
import { parseForm, FileUpload as ParsedFileUpload } from '../../utils/parser';
import { base64ToBuffer } from '../alfresco/fileRequestBuilder/alfrescoRequestBuilder';
import {
  updateOrCreateBalise,
  validateBalisesLockedByUser,
  VALID_EXTENSIONS,
  MIN_BALISE_ID,
  MAX_BALISE_ID,
  isValidExtension,
  parseBaliseIdFromFilename,
} from '../../utils/baliseUtils';
import type { FileUpload } from '../../utils/s3utils';
import { getRataExtraLambdaError } from '../../utils/errors';

interface FileValidationError {
  filename: string;
  error: string;
}

/**
 * Validate uploaded files for a specific balise
 * - Extension must be .il, .leu, or .bis
 * - Filename must contain a balise ID that matches the target balise ID
 * - Balise ID must be between 10000-99999
 */
export function validateUploadedFiles(files: ParsedFileUpload[], targetBaliseId: number): FileValidationError[] {
  const errors: FileValidationError[] = [];

  for (const file of files) {
    // Validate extension
    if (!isValidExtension(file.filename)) {
      errors.push({
        filename: file.filename,
        error: `Virheellinen tiedostopääte. Sallitut päätteet: ${VALID_EXTENSIONS.join(', ')}`,
      });
      continue;
    }

    // Parse balise ID from filename
    const fileBaliseId = parseBaliseIdFromFilename(file.filename);
    if (fileBaliseId === null) {
      errors.push({
        filename: file.filename,
        error: 'Tiedostonimestä ei löydy baliisi-tunnusta',
      });
      continue;
    }

    // Validate filename balise ID matches target balise ID
    if (fileBaliseId !== targetBaliseId) {
      errors.push({
        filename: file.filename,
        error: `Tiedostonimen baliisi-tunnus (${fileBaliseId}) ei vastaa kohde-baliisia (${targetBaliseId})`,
      });
      continue;
    }
  }

  return errors;
}

export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);

    // Extract balise ID from path (e.g., /api/balise/12345/add)
    const pathParts = event.path.split('/').filter((p) => p);
    const baliseIdStr = pathParts[pathParts.indexOf('balise') + 1];
    const baliseId = parseInt(baliseIdStr || '0', 10);

    log.info(user, `Create or update balise. id: ${baliseId}, path: ${event.path}`);

    if (!baliseId || isNaN(baliseId)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Virheellinen tai puuttuva baliisi-tunnus' }),
      };
    }

    // Validate balise ID range
    if (baliseId < MIN_BALISE_ID || baliseId > MAX_BALISE_ID) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: `Baliisi-tunnus ${baliseId} ei ole sallitulla välillä ${MIN_BALISE_ID}-${MAX_BALISE_ID}`,
        }),
      };
    }

    validateBaliseWriteUser(user);

    const lockValidationResponse = await validateBalisesLockedByUser([baliseId], user.uid);
    if (lockValidationResponse) return lockValidationResponse;

    // Check if this is a file upload (multipart/form-data) or metadata only (JSON)
    const contentType = event.headers?.['content-type'] || event.headers?.['Content-Type'] || '';
    const isFileUpload = contentType.includes('multipart/form-data');

    let body: {
      description?: string;
      fileTypes?: string[];
      version?: number;
      baliseData?: string;
    } = {};
    let uploadedFiles: ParsedFileUpload[] = [];

    if (isFileUpload) {
      // Handle file upload
      const buffer = event.isBase64Encoded ? base64ToBuffer(event.body as string) : event.body;
      const formData = await parseForm(buffer ?? '', event.headers as ALBEventHeaders);

      // Extract metadata from form
      if (formData.baliseData) {
        body = JSON.parse(formData.baliseData as string);
      }

      // Extract file data
      uploadedFiles = (formData.files as FileUpload[]) || [];
      // Validate uploaded files
      if (uploadedFiles.length > 0) {
        const validationErrors = validateUploadedFiles(uploadedFiles, baliseId);
        if (validationErrors.length > 0) {
          return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              error: 'Tiedostojen validointi epäonnistui',
              validationErrors,
              hint: `Tiedostonimen tulee sisältää baliisi-tunnus ${baliseId} ja päätteen tulee olla ${VALID_EXTENSIONS.join(', ')} (esim. ${baliseId}.il)`,
            }),
          };
        }
      }
    } else {
      // Handle JSON metadata only
      body = event.body ? JSON.parse(event.body) : {};
    }

    // Convert to FileUpload format
    const files: FileUpload[] = uploadedFiles.map((file) => ({
      filename: file.filename,
      buffer: file.buffer,
    }));

    const result = await updateOrCreateBalise({
      baliseId,
      files,
      description: body.description,
      userId: user.uid,
    });

    const statusCode = result.isNewBalise ? 201 : 200;

    return {
      statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.balise),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
