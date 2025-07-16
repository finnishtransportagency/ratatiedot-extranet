import { ALBEvent, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from './client';
import { handlerWrapper } from '../handler-wrapper';

const database = await DatabaseClient.build();

/**
 * Get list of activities with `showAsBanner` value true. I.e. get list of "banners"
 * Example request: /api/banners
 * @param {ALBEvent} event
 * @returns  {Promise<ALBResult>} JSON stringified object of contents inside body
 */
export const handleRequest = handlerWrapper(async (event: ALBEvent): Promise<ALBResult> => {
  try {
    const user = await getUser(event);

    log.info(user, 'Get list of active banners');
    validateReadUser(user);

    const banners = await database.notice.findMany({
      where: {
        showAsBanner: true,
        publishTimeStart: {
          lte: new Date(),
        },
        publishTimeEnd: {
          gte: new Date(),
        },
      },
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(banners),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
});
