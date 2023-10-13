import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getMockUser, validateReadUser } from '../../utils/userService';
//import { DatabaseClient } from '../database/client';

//const database = await DatabaseClient.build();

/**
 * Get the list of recent activities
 * @returns {Promise<unknown>} List of activities
 */
export async function handleRequest(): Promise<unknown> {
  try {
    const user = getMockUser();
    validateReadUser(user);

    log.info(`Fetching alfresco activities and populating database..`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
