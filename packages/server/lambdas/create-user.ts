import { APIGatewayEvent, Context } from 'aws-lambda';
import { getRataExtraLambdaError } from '../utils/errors.js';
import { log } from '../utils/logger.js';
import { getUser, validateWriteUser } from '../utils/userService.js';
import { DatabaseClient } from './database-client/index.js';

const database = await DatabaseClient.build();

export async function handleRequest(_event: APIGatewayEvent, _context: Context) {
  try {
    const user = await getUser(_event);
    // TODO: Validate write rights
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
      console.log('res: ', response.body);
      return response;
    })
    .catch(async (e) => {
      log.error(e);
    });
}
