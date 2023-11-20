import { ALBEvent, ALBResult } from 'aws-lambda';

import { RataExtraLambdaError, getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateAdminUser } from '../../utils/userService';
import { DatabaseClient } from './client';

const database = await DatabaseClient.build();

/**
 * Delete notice by id. Example request: /api/notice/:id
 * @param {ALBEvent} event
 * @returns  {Promise<ALBResult>} JSON stringified object of contents inside body
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notice),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
