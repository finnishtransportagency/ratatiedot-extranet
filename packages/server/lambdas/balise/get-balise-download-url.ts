import { ALBEvent, ALBResult } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';

const database = await DatabaseClient.build();
const s3 = new S3();
const BALISES_BUCKET_NAME = process.env.BALISES_BUCKET_NAME || '';
// Using existing AWS SDK v2 (same as s3utils.ts) to generate presigned URLs

export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);

    const fileName = event.queryStringParameters?.fileName;

    log.info(user, `Get download URL for balise ${baliseId}, fileName: ${fileName}, path: ${event.path}`);

    if (!baliseId || isNaN(baliseId)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid or missing balise ID' }),
      };
    }

    if (!fileName) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing fileName parameter' }),
      };
    }

    validateReadUser(user);

    const balise = await database.balise.findUnique({
      where: { secondaryId: baliseId },
    });

    if (!balise) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Balise not found' }),
      };
    }

    // Check if the requested file exists for this balise
    if (!balise.fileTypes.includes(fileName)) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: `File '${fileName}' not found for this balise` }),
      };
    }

    // Check if balise is locked - prevent downloads for locked balises
    if (balise.locked) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Cannot download files from a locked balise',
          lockedBy: balise.lockedBy,
          lockedTime: balise.lockedTime,
        }),
      };
    }

    // Generate S3 file key with hierarchical structure: balise_{secondaryId}/v{version}/{fileName}
    const fileKey = `balise_${balise.secondaryId}/v${balise.version}/${fileName}`;

    // Generate presigned URL (expires in 1 hour)
    const downloadUrl = s3.getSignedUrl('getObject', {
      Bucket: BALISES_BUCKET_NAME,
      Key: fileKey,
      Expires: 3600, // 1 hour
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        downloadUrl,
        expiresIn: 3600,
        fileName,
        baliseId: balise.secondaryId,
      }),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
