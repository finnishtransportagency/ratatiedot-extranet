import AWS from 'aws-sdk';
import { getUser, validateAdminUser } from '../../utils/userService';
import { ALBEvent, ALBEventHeaders, ALBResult } from 'aws-lambda';
import { getRataExtraLambdaError } from '../../utils/errors';
import { log, auditLog } from '../../utils/logger';
import { parseForm } from '../../utils/parser';

const s3 = new AWS.S3();
const RATAEXTRA_STACK_IDENTIFIER = process.env.RATAEXTRA_STACK_IDENTIFIER;

/**
 * Upload image to S3 Example request: /api/images
 * @param {ALBEvent} event
 * @param {{string}} event.path Path should end with the page to upload the file to
 * @param {{string}} event.body File contents and metadata to upload
 * @returns  {Promise<any>} JSON stringified URL of the image
 */

export async function handleRequest(event: ALBEvent): Promise<ALBResult | undefined> {
  try {
    const user = await getUser(event);
    log.info(user, `Uploading image`);

    validateAdminUser(user);

    const form = await parseForm(event.body as string, event.headers as ALBEventHeaders);
    console.log('form', form);

    const params = {
      Bucket: `s3-${RATAEXTRA_STACK_IDENTIFIER}-images`,
      Key: 'fileName',
      Body: 'fileData',
      ACL: 'private',
    };

    await s3.upload(params).promise();
    const imageUrl = `https://${RATAEXTRA_STACK_IDENTIFIER}-images.s3.eu-west-1.amazonaws.com/${'fileName'}`;

    auditLog.info(user, `Uploaded image`);
    return {
      statusCode: 200,
      headers: { 'Content-Type:': 'application/json' },
      body: JSON.stringify(imageUrl),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
