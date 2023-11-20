import { ALBEvent, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateAdminUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from './client';

const database = await DatabaseClient.build();

/**
 * Get list of notices. Example request: /api/notices?published=true?count=10
 * @param {ALBEvent} event
 * @returns  {Promise<ALBResult>} JSON stringified object of contents inside body
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const queryParams = event.queryStringParameters;
    const user = await getUser(event);

    log.info(user, 'Get list of notices');
    validateReadUser(user);

    let notices;
    const resultCount = parseInt(queryParams?.count || '10');

    if (queryParams?.unpublished === 'true') {
      validateAdminUser(user);
      notices = await database.notice.findMany({ take: resultCount });
    } else {
      notices = await database.notice.findMany({
        where: {
          publishTimeStart: {
            lte: new Date(),
          },
        },
        take: resultCount,
      });
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notices),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
