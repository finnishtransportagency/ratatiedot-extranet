import { ALBEvent, ALBResult } from 'aws-lambda';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';

const database = await DatabaseClient.build();
const BUCKET_NAME = process.env.BALISE_BUCKET_NAME || 'rataextra-balise-files';

export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    const baliseId = parseInt(event.path.split('/')[3] || '0');
    const fileType = event.queryStringParameters?.fileType || 'pdf';

    log.info(user, `Get download URL for balise ${baliseId}, fileType: ${fileType}`);
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

    const fileKey = `${balise.bucketId}/${fileType}`;

    // TODO: Implement S3 presigned URL generation
    // You'll need to add @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner dependencies
    const downloadUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;

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
