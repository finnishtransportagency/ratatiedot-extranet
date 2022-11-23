import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { log } from '../utils/logger';
import { getRataExtraLambdaError } from '../utils/errors';

/**
 * DRAFT IMPLEMENTATION
 * Generates a pre-signed url for a file in S3 bucket. Currently takes input in the POST request body.
 */
export async function handleRequest(_event: APIGatewayEvent, _context: Context): Promise<APIGatewayProxyResult> {
  try {
    log.info('dummyLambda: Test log for dummy lambda');
    log.debug('dummyLambda: Sending dummy reply.');
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify('Success!'),
    };
  } catch (err: unknown) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
