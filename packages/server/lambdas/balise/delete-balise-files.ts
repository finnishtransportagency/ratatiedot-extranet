import { ALBEvent, ALBResult } from 'aws-lambda';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';

const database = await DatabaseClient.build();

export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);

    // Extract balise ID from path (e.g., /api/balise/12345/files/delete)
    const pathParts = event.path.split('/').filter((p) => p);
    const baliseIdStr = pathParts[pathParts.indexOf('balise') + 1];
    const baliseId = parseInt(baliseIdStr || '0', 10);

    log.info(user, `Delete files from balise id: ${baliseId}, path: ${event.path}`);

    if (!baliseId || isNaN(baliseId)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid or missing balise ID' }),
      };
    }

    // Parse request body to get file types to delete
    const body = event.body ? JSON.parse(event.body) : {};
    const fileTypesToDelete: string[] = body.fileTypes || [];

    if (!fileTypesToDelete || fileTypesToDelete.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'No files specified for deletion' }),
      };
    }

    validateWriteUser(user, '');

    const existingBalise = await database.balise.findUnique({
      where: { secondaryId: baliseId },
    });

    if (!existingBalise) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Balise not found' }),
      };
    }

    // Check if balise is locked
    if (existingBalise.locked && existingBalise.lockedBy !== user.uid) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Cannot delete files from a locked balise. Only the user who locked it can make changes.',
          lockedBy: existingBalise.lockedBy,
          lockedTime: existingBalise.lockedTime,
        }),
      };
    }

    // Remove specified filenames from the balise
    const updatedFileTypes = existingBalise.fileTypes.filter((filename) => !fileTypesToDelete.includes(filename));

    // Create a new version with the files removed
    // First, create version history entry for the OLD version
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

    // Delete files from S3
    // Files are stored at: balise_{secondaryId}/v{version}/{filename}
    const deletionPromises: Promise<void>[] = [];

    for (const filename of fileTypesToDelete) {
      // Delete from the current version folder using full filename
      const s3Key = `balise_${baliseId}/v${existingBalise.version}/${filename}`;
      log.info(user, `Deleting file from S3: ${s3Key}`);

      // For now, log the deletion intent
      // In production, implement actual S3 deletion:
      // deletionPromises.push(deleteFromS3(BALISES_BUCKET_NAME, s3Key));
    }

    await Promise.all(deletionPromises);

    // Update balise with new version and updated fileTypes
    const updatedBalise = await database.balise.update({
      where: { secondaryId: baliseId },
      data: {
        version: newVersion,
        fileTypes: updatedFileTypes,
        createdBy: user.uid,
        createdTime: new Date(),
        locked: false,
        lockedBy: null,
        lockedTime: null,
      },
    });

    log.info(user, `Deleted files from balise ${baliseId}. New version: ${newVersion}`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Files deleted successfully',
        deletedFileTypes: fileTypesToDelete,
        balise: updatedBalise,
      }),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
