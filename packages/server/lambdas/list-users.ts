import { ALBEvent, Context } from 'aws-lambda';
// import { getRataExtraLambdaError } from '../utils/errors.js';
// import { log } from '../utils/logger.js';
// import { getUser, validateReadUser } from '../utils/userService.js';
import { DatabaseClient } from './database-client/index.js';

const database = await DatabaseClient.build();

export async function handleRequest(_event: ALBEvent, _context: Context) {
  //  try {
  //    const user = await getUser(event);
  //    await validateReadUser(user);
  //  } catch (err) {
  //    log.error(err);
  //    return getRataExtraLambdaError(err);
  //  }
  try {
    const users = await database.user.findMany({
      include: { profile: true },
    });
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(users),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error),
    };
  }
}
