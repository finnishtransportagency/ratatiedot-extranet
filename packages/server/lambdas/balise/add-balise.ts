import { ALBEvent, ALBEventHeaders, ALBResult } from 'aws-lambda';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { uploadToS3 } from '../../utils/s3utils';
import { parseForm } from '../../utils/parser';
import { base64ToBuffer } from '../alfresco/fileRequestBuilder/alfrescoRequestBuilder';
import { FileInfo } from 'busboy';

const database = await DatabaseClient.build();
const BALISES_BUCKET_NAME = process.env.BALISES_BUCKET_NAME || '';
// File uploads will use the existing uploadToS3 utility from s3utils.ts
// S3 path structure: balise_{secondaryId}/v{version}/{filename}

export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    const baliseId = parseInt(event.path.split('/').pop() || '0');

    log.info(user, `Create or update balise. id: ${baliseId}`);
    validateWriteUser(user, '');

    // Check if this is a file upload (multipart/form-data) or metadata only (JSON)
    const contentType = event.headers?.['content-type'] || event.headers?.['Content-Type'] || '';
    const isFileUpload = contentType.includes('multipart/form-data');

    let body: {
      description?: string;
      bucketId?: string;
      fileTypes?: string[];
      version?: number;
      baliseData?: string;
    } = {};
    let fileData: Buffer | null = null;
    let filename = '';

    if (isFileUpload) {
      // Handle file upload
      const buffer = event.isBase64Encoded ? base64ToBuffer(event.body as string) : event.body;
      const formData = await parseForm(buffer ?? '', event.headers as ALBEventHeaders);

      // Extract metadata from form
      if (formData.baliseData) {
        body = JSON.parse(formData.baliseData as string);
      }

      // Extract file data
      fileData = formData.filedata as Buffer;
      if (formData.fileinfo) {
        const fileInfo = formData.fileinfo as FileInfo;
        filename = fileInfo.filename;
      }
    } else {
      // Handle JSON metadata only
      body = event.body ? JSON.parse(event.body) : {};
    }

    const existingBalise = await database.balise.findUnique({
      where: { secondaryId: baliseId },
    });

    if (existingBalise) {
      // Create version history entry
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

      const newVersion = existingBalise.version + 1;

      // If file is uploaded, add its type to fileTypes array
      let updatedFileTypes = body.fileTypes || existingBalise.fileTypes;
      if (fileData && filename) {
        const fileExt = filename.split('.').pop()?.toUpperCase() || 'OTHER';
        if (!updatedFileTypes.includes(fileExt)) {
          updatedFileTypes = [...updatedFileTypes, fileExt];
        }

        // Upload file to S3 with hierarchical path: balise_{secondaryId}/v{version}/{filename}
        const s3Key = `balise_${baliseId}/v${newVersion}/${filename}`;
        await uploadToS3(BALISES_BUCKET_NAME, s3Key, fileData);
        log.info(user, `Uploaded file to S3: ${s3Key}`);
      }

      const updatedBalise = await database.balise.update({
        where: { secondaryId: baliseId },
        data: {
          version: newVersion,
          description: body.description || existingBalise.description,
          bucketId: body.bucketId || existingBalise.bucketId,
          fileTypes: updatedFileTypes,
          createdBy: user.uid,
          createdTime: new Date(),
          locked: false,
          lockedBy: null,
          lockedTime: null,
        },
      });

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBalise),
      };
    } else {
      // Creating new balise
      const newVersion = body.version || 1;
      let fileTypes = body.fileTypes || [];

      // If file is uploaded, add its type to fileTypes array
      if (fileData && filename) {
        const fileExt = filename.split('.').pop()?.toUpperCase() || 'OTHER';
        if (!fileTypes.includes(fileExt)) {
          fileTypes = [...fileTypes, fileExt];
        }

        // Upload file to S3 with hierarchical path: balise_{secondaryId}/v{version}/{filename}
        const s3Key = `balise_${baliseId}/v${newVersion}/${filename}`;
        await uploadToS3(BALISES_BUCKET_NAME, s3Key, fileData);
        log.info(user, `Uploaded file to S3: ${s3Key}`);
      }

      const newBalise = await database.balise.create({
        data: {
          secondaryId: baliseId,
          version: newVersion,
          description: body.description || '',
          bucketId: body.bucketId || `balise-${baliseId}`,
          fileTypes,
          createdBy: user.uid,
          createdTime: new Date(),
          locked: false,
        },
      });

      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBalise),
      };
    }
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
