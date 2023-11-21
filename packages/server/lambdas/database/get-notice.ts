import { ALBEvent, ALBResult } from 'aws-lambda';

import { RataExtraLambdaError, getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateAdminUser, validateReadUser } from '../../utils/userService';
import { DatabaseClient } from './client';

const database = await DatabaseClient.build();

/**
 * Get single notice by id. Example request: /api/notice/:id
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

    log.info(user, 'Get notice by id' + noticeId);
    validateReadUser(user);

    const notice = await database.notice.findUnique({ where: { id: noticeId } });

    if ((notice?.publishTimeStart as Date) > new Date()) {
      validateAdminUser(user);
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
    return getRataExtraLambdaError(err);
  }
}
