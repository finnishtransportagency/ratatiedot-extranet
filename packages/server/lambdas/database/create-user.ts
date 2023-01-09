import { ALBEvent, Context } from 'aws-lambda';
import { getRataExtraLambdaError } from '../../utils/errors.js';
import { log } from '../../utils/logger.js';
import { getUser, validateWriteUser } from '../../utils/userService.js';
import { DatabaseClient } from '/opt/nodejs/dbClient';

const database = await DatabaseClient.build();

/**
 * @DEPRECATED
 */
export async function handleRequest(event: ALBEvent, _context: Context) {
  try {
    const user = await getUser(event);
    log.info(user, 'Creating temp users');
    // Temp hardcoding for deprecated handler
    validateWriteUser(user, 'Ratatieto_admin');
    const createdUser = await database.user.create({
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
    });
    const response = {
      statusCode: 200,
      headers: {
        my_header: 'my_value',
      },
      body: JSON.stringify(createdUser),
      isBase64Encoded: false,
    };
    return response;
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
