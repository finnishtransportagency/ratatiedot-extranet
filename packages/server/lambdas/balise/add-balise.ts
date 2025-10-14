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

    // Extract balise ID from path (e.g., /api/balise/12345/add)
    const pathParts = event.path.split('/').filter((p) => p);
    const baliseIdStr = pathParts[pathParts.indexOf('balise') + 1];
    const baliseId = parseInt(baliseIdStr || '0', 10);

    log.info(user, `Create or update balise. id: ${baliseId}, path: ${event.path}`);

    if (!baliseId || isNaN(baliseId)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid or missing balise ID' }),
      };
    }

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
      // Check if balise is locked - prevent editing locked balises
      if (existingBalise.locked && existingBalise.lockedBy !== user.uid) {
        return {
          statusCode: 403,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'Cannot edit a locked balise. Only the user who locked it can make changes.',
            lockedBy: existingBalise.lockedBy,
            lockedTime: existingBalise.lockedTime,
          }),
        };
      }

      // Determine if this is a metadata update or just a file upload
      const hasMetadataChange = !isFileUpload || (body.description && body.description !== existingBalise.description);
      const currentVersion = existingBalise.version;
      let newVersion = currentVersion;

      // Only create a new version if metadata is being changed
      if (hasMetadataChange) {
        // Create version history entry for the OLD version
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

        newVersion = existingBalise.version + 1;
        log.info(user, `Creating new version ${newVersion} for balise ${baliseId}`);
      } else {
        log.info(user, `Adding file to existing version ${currentVersion} for balise ${baliseId}`);
      }

      // If file is uploaded, add its type to fileTypes array
      let updatedFileTypes = existingBalise.fileTypes;
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

      // Update balise record
      const updateData: {
        fileTypes: string[];
        version?: number;
        description?: string;
        bucketId?: string;
        createdBy?: string;
        createdTime?: Date;
        locked?: boolean;
        lockedBy?: string | null;
        lockedTime?: Date | null;
      } = {
        fileTypes: updatedFileTypes,
      };

      // Only update version and metadata if this is a metadata change
      if (hasMetadataChange) {
        updateData.version = newVersion;
        updateData.description = body.description || existingBalise.description;
        updateData.bucketId = body.bucketId || existingBalise.bucketId;
        updateData.createdBy = user.uid;
        updateData.createdTime = new Date();
        updateData.locked = false;
        updateData.lockedBy = null;
        updateData.lockedTime = null;
      }

      const updatedBalise = await database.balise.update({
        where: { secondaryId: baliseId },
        data: updateData,
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
