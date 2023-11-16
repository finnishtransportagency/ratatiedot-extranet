import { ALBEvent, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateAdminUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from './client';

const database = await DatabaseClient.build();

// const getPublishedNotices = async () => {
//   const notices = await database.notice.findMany({
//     where: {
//       publishTimeStart: {
//         gt: new Date(),
//       },
//     },
//     select: {
//       id: true,
//       title: true,
//       publishTimeStart: true,
//       showAsBanner: true,
//     },
//   });
//
//   return notices;
// };

const getAllNotices = async () => {
  const notices = await database.notice.findMany({
    select: {
      id: true,
      title: true,
      publishTimeStart: true,
      showAsBanner: true,
    },
  });

  return notices;
};

/**
 * Get list of notices containing basic information. Example request: /api/notices
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

    if (queryParams?.unpublished === 'true') {
      validateAdminUser(user);
      notices = getAllNotices();
    }

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
