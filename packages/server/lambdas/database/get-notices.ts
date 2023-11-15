import { ALBEvent, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from './client';

const database = await DatabaseClient.build();

/**
 * Get list of notices containing basic information. Example request: /api/notices
 * @param {ALBEvent} event
 * @returns  {Promise<ALBResult>} JSON stringified object of contents inside body
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    log.info(user, 'Get list of notices');
    validateReadUser(user);

    // maybe logic where read user can see only currently available notices. Timed notices only for write users???
    const notices = await database.notices.findMany({});

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notices }),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
