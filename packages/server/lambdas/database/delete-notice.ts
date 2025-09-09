import * as Sentry from '@sentry/aws-serverless';
import { ALBEvent, ALBResult } from 'aws-lambda';

import { RataExtraLambdaError, getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateAdminUser } from '../../utils/userService';
import { DatabaseClient } from './client';
import { deleteFromS3 } from '../../utils/s3utils';
import { handlerWrapper } from '../handler-wrapper';

const database = await DatabaseClient.build();
const RATAEXTRA_STACK_IDENTIFIER = process.env.RATAEXTRA_STACK_IDENTIFIER;

/**
 * Delete notice by id. Example request: /api/notice/:id
 * @param {ALBEvent} event
 * @returns  {Promise<ALBResult>} JSON stringified object of contents inside body
 */
export const handleRequest = handlerWrapper(async (event: ALBEvent): Promise<ALBResult> => {
  try {
    const paths = event.path.split('/');
    const noticeId = paths.pop();
    const user = await getUser(event);

    if (!noticeId || noticeId === 'notice') {
      throw new RataExtraLambdaError('Notice ID missing from path', 400);
    }

    log.info(user, 'Delete notice by id' + noticeId);
    validateAdminUser(user);

    const notice = await database.notice.delete({ where: { id: noticeId } });

    const bucket = `s3-${RATAEXTRA_STACK_IDENTIFIER}-images`;
    const imageElement = notice.content.find((element) => element.type === 'image');

    if (imageElement) {
      await deleteFromS3(bucket, imageElement.url);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notice),
    };
  } catch (err) {
    log.error(err);
    Sentry.captureException(err);
    return getRataExtraLambdaError(err);
  }
});
