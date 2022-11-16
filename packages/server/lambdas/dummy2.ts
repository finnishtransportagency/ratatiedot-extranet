import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { logger } from '../utils/logger';
import { getRataExtraLambdaError } from '../utils/errors';

/**
 * DRAFT IMPLEMENTATION
 * Generates a pre-signed url for a file in S3 bucket. Currently takes input in the POST request body.
 */
export async function handleRequest(_event: APIGatewayEvent, _context: Context): Promise<APIGatewayProxyResult> {
  try {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify('Success2!'),
    };
  } catch (err: unknown) {
    logger.log(err);
    return getRataExtraLambdaError(err);
  }
}
