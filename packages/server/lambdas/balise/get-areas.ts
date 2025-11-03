import { ALBEvent, ALBResult } from 'aws-lambda';
import { log } from '../../utils/logger';
import { getRataExtraLambdaError } from '../../utils/errors';
import { getUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';

const database = await DatabaseClient.build();

/**
 * Get an array of areas. Example request: /api/balises/areas
 * @param {ALBEvent} event
 * @param {{QueryRequest}} event.body JSON stringified
 * @returns  {Promise<ALBResult>} JSON stringified object of contents inside body
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);

    log.info(user, `Get all areas. params: ${JSON.stringify(event.queryStringParameters)}`);
    validateReadUser(user);

    const response = await database.area.findMany({
      orderBy: {
        key: 'asc',
      },
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
