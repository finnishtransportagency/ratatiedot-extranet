import { ALBEvent, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError } from '../../utils/errors';
import { devLog, log } from '../../utils/logger';
import { getUser, isAdmin, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from './client';
import { Prisma } from '@prisma/client';

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

    const resultCount = parseInt(queryParams?.count || '10');
    const skip = queryParams?.page ? (parseInt(queryParams?.page) - 1) * resultCount : 0;

    const whereDefaultOptions = {
      where: {
        publishTimeStart: {
          lte: new Date(),
        },
        OR: [
          {
            publishTimeEnd: {
              gte: new Date(),
            },
          },
          {
            publishTimeEnd: null,
          },
        ],
      },
    };

    const defaultOptions = {
      ...whereDefaultOptions,
      take: resultCount,
      skip,
      orderBy: {
        publishTimeStart: Prisma.SortOrder.desc,
      },
    };

    const adminOptions = {
      take: resultCount,
      skip,
      orderBy: {
        publishTimeStart: Prisma.SortOrder.desc,
      },
    };

    const notices = await database.notice.findMany(isAdmin(user) ? adminOptions : defaultOptions);
    const totalItems = await database.notice.count(isAdmin(user) ? undefined : whereDefaultOptions);

    devLog.debug({ notices, totalItems });

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
