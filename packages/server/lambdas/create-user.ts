import { ALBEvent, Context } from 'aws-lambda';
import { getRataExtraLambdaError } from '../utils/errors.js';
import { auditLog, log } from '../utils/logger.js';
import { getUser, validateWriteUser } from '../utils/userService.js';
import { DatabaseClient } from './database-client/index.js';

const database = await DatabaseClient.build();

export async function handleRequest(event: ALBEvent, _context: Context) {
  try {
    const user = await getUser(event);
    auditLog.info(user, 'Creating temp users');
    await validateWriteUser(user);
    const cretedUser = await database.user.create({
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
      body: JSON.stringify(cretedUser),
      isBase64Encoded: false,
    };
    return response;
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
