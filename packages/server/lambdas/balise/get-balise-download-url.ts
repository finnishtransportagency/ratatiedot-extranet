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

    // Extract balise ID from path (e.g., /api/balise/12345/download)
    const pathParts = event.path.split('/').filter((p) => p);
    const baliseIdStr = pathParts[pathParts.indexOf('balise') + 1];
    const baliseId = parseInt(baliseIdStr || '0', 10);
    const fileType = event.queryStringParameters?.fileType || 'pdf';

    log.info(user, `Get download URL for balise ${baliseId}, fileType: ${fileType}, path: ${event.path}`);

    if (!baliseId || isNaN(baliseId)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid or missing balise ID' }),
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

    // Generate S3 file key with hierarchical structure: balise_{secondaryId}/v{version}/{fileType}
    const fileKey = `balise_${balise.secondaryId}/v${balise.version}/${fileType}`;

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
        fileKey,
        baliseId: balise.secondaryId,
      }),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
