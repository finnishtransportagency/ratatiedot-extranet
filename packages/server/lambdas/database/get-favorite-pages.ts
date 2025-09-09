import * as Sentry from '@sentry/aws-serverless';
import { ALBEvent, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from './client';
import { handlerWrapper } from '../handler-wrapper';

const database = await DatabaseClient.build();

/**
 * List user's all favorite pages. Example request: GET /api/database/favorites
 * @param {ALBEvent} event
 * @param {{string}} event.path Path should end with the page to get the custom content for
 * @returns  {Promise<ALBResult>} JSON stringified object of contents inside body
 */
export const handleRequest = handlerWrapper(async (event: ALBEvent): Promise<ALBResult> => {
  try {
    const user = await getUser(event);
    log.info(user, 'List favorite category pages');
    validateReadUser(user);

    const data = await database.favoriteCategory.findMany({
      where: {
        userId: user.uid,
      },
      select: {
        id: true,
        categoryDataBase: {
          select: {
            rataextraRequestPage: true,
            alfrescoFolder: true,
          },
        },
      },
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    log.error(err);
    Sentry.captureException(err);
    return getRataExtraLambdaError(err);
  }
});
