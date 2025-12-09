import { ALBEvent, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, isAdmin, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from './client';
import { Notice, Prisma } from '@prisma/client';

const database = await DatabaseClient.build();

export const getStatus = (notice: Notice) => {
  if (notice.publishTimeStart > new Date()) {
    return 'scheduled';
  } else if (notice.publishTimeEnd && notice.publishTimeEnd < new Date()) {
    return 'archived';
  } else {
    return 'published';
  }
};

const extendNotices = (notices: Notice[]) => {
  const extendedNotices = notices.map((notice) => {
    return {
      ...notice,
      state: getStatus(notice),
    };
  });

  return extendedNotices;
};

export const buildNoticesQuery = (isAdmin: boolean, resultCount: number, skip: number) => {
  const baseQuery = {
    take: resultCount,
    skip,
    orderBy: {
      publishTimeStart: Prisma.SortOrder.desc,
    },
  };

  if (isAdmin) {
    return baseQuery;
  }

  return {
    ...baseQuery,
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
};

export const buildNoticesCountQuery = (isAdmin: boolean) => {
  if (isAdmin) {
    return undefined;
  }

  return {
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
};

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

    const isUserAdmin = Boolean(isAdmin(user));
    const noticesQuery = buildNoticesQuery(isUserAdmin, resultCount, skip);

    const noticesResponse = await database.notice.findMany(noticesQuery);
    // noticesResponse can be paginated, get total count separately
    const totalNoticesCount = await database.notice.count(buildNoticesCountQuery(isUserAdmin));

    const notices = extendNotices(noticesResponse);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notices, totalItems: totalNoticesCount }),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
