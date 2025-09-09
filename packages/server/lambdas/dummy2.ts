import * as Sentry from '@sentry/aws-serverless';
import { ALBEvent, APIGatewayProxyResult } from 'aws-lambda';
import { log } from '../utils/logger';
import { getRataExtraLambdaError } from '../utils/errors';
import { getUser, validateReadUser } from '../utils/userService';
import { handlerWrapper } from './handler-wrapper';

/**
 * @DEPRECATED
 * DRAFT IMPLEMENTATION
 * Generates a pre-signed url for a file in S3 bucket. Currently takes input in the POST request body.
 */
export const handleRequest = handlerWrapper(async (_event: ALBEvent): Promise<APIGatewayProxyResult> => {
  try {
    const user = await getUser(_event);
    validateReadUser(user);
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
    Sentry.captureException(err);
    return getRataExtraLambdaError(err);
  }
});
