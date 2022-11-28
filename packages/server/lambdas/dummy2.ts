import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { log } from '../utils/logger';
import { getRataExtraLambdaError } from '../utils/errors';
import { getUser, validateReadUser } from '../utils/userService';

/**
 * DRAFT IMPLEMENTATION
 * Generates a pre-signed url for a file in S3 bucket. Currently takes input in the POST request body.
 */
export async function handleRequest(_event: APIGatewayEvent, _context: Context): Promise<APIGatewayProxyResult> {
  try {
    const user = await getUser(_event);
    await validateReadUser(user);
    log.info(user, 'dummy2Lambda: Sending dummy2 reply.');
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify('Success2!'),
    };
  } catch (err: unknown) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
