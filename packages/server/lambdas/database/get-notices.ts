import { ALBEvent, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateAdminUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from './client';

const database = await DatabaseClient.build();

/**
 * Get list of notices. Example request: /api/notices?published=true?count=10
 * @param {ALBEvent} event
 * @param {{QueryRequest}} event.body JSON stringified
 * @returns  {Promise<ALBResult>} JSON stringified object of contents inside body
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const queryParams = event.queryStringParameters;
    const user = await getUser(event);

    log.info(user, 'Get list of notices');
    validateReadUser(user);

    let notices;
    let totalItems;
    const resultCount = parseInt(queryParams?.count || '10');
    const skip = queryParams?.page ? (parseInt(queryParams?.page) - 1) * resultCount : 0;

    if (queryParams?.unpublished === 'true') {
      validateAdminUser(user);
      notices = await database.notice.findMany({
        take: resultCount,
        skip,
        orderBy: {
          publishTimeStart: 'desc',
        },
      });
      totalItems = await database.notice.count();
    } else {
      notices = await database.notice.findMany({
        where: {
          publishTimeStart: {
            lte: new Date(),
          },
        },
        take: resultCount,
        skip,
        orderBy: {
          publishTimeStart: 'desc',
        },
      });
      totalItems = await database.notice.count({
        where: {
          publishTimeStart: {
            lte: new Date(),
          },
        },
      });
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notices, totalItems }),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
