import { ALBEvent, ALBEventHeaders, ALBResult } from 'aws-lambda';
import { log } from '../../utils/logger';
import { getUser, validateBaliseWriteUser } from '../../utils/userService';
import { parseForm, FileUpload as ParsedFileUpload } from '../../utils/parser';
import { base64ToBuffer } from '../alfresco/fileRequestBuilder/alfrescoRequestBuilder';
import { updateOrCreateBalise, validateBalisesLockedByUser } from '../../utils/baliseUtils';
import type { FileUpload } from '../../utils/s3utils';
import { getRataExtraLambdaError } from '../../utils/errors';

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
