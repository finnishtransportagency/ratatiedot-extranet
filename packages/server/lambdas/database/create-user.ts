import { ALBEvent, Context } from 'aws-lambda';
import { getRataExtraLambdaError } from '../../utils/errors.js';
import { log } from '../../utils/logger.js';
import { getUser, validateWriteUser } from '../../utils/userService.js';
import { DatabaseClient } from './client/index.js';

const database = await DatabaseClient.build();

/**
 * @DEPRECATED
 */
export async function handleRequest(event: ALBEvent, _context: Context) {
  try {
    const user = await getUser(event);
    log.info(user, 'Creating temp users');
    await validateWriteUser(user);
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
  await database.user
    .create({
      data: {
        name: 'Alice',
        email: Date.now() + '@email.com',
        posts: {
          create: { title: 'Hello World' },
        },
        profile: {
          create: { bio: 'I like turtles' },
        },
      },
    })
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
