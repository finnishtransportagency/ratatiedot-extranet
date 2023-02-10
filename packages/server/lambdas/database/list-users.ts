import { ALBEvent, Context } from 'aws-lambda';
import { getRataExtraLambdaError } from '../../utils/errors.js';
import { log } from '../../utils/logger.js';
import { getUser, validateReadUser } from '../../utils/userService.js';
import { DatabaseClient } from './client/index.js';

const database = await DatabaseClient.build();

/**
 * @DEPRECATED
 */
export async function handleRequest(event: ALBEvent, _context: Context) {
  try {
    const user = await getUser(event);
    log.info(`User ${user.uid} is listing users`);
    validateReadUser(user);
    const users = await database.user.findMany({ take: 10 });
    const response = {
      statusCode: 200,
      headers: {
        my_header: 'my_value',
      },
      body: JSON.stringify(users),
      isBase64Encoded: false,
    };
    return response;
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
