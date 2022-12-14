import { ALBEvent, Context } from 'aws-lambda';
import { getRataExtraLambdaError } from '../../utils/errors.js';
import { log } from '../../utils/logger.js';
import { getUser, validateReadUser } from '../../utils/userService.js';
import { DatabaseClient } from './client/index.js';
// DEPRECATED
const database = await DatabaseClient.build();

export async function handleRequest(event: ALBEvent, _context: Context) {
  try {
    const user = await getUser(event);
    log.info(user, 'Listing users');
    await validateReadUser(user);
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
  await database.user
    .findMany({ take: 10 })
    .then((res) => {
      const response = {
        statusCode: 200,
        headers: {
          my_header: 'my_value',
        },
        body: JSON.stringify(res),
        isBase64Encoded: false,
      };
      return response;
    })
    .catch(async (e) => {
      log.error(e);
    });
}
