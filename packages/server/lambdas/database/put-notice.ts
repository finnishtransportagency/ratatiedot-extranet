import { ALBEvent, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError } from '../../utils/errors';
import { devLog, log } from '../../utils/logger';
import { getUser, validateAdminUser } from '../../utils/userService';
import { DatabaseClient } from './client';
import { Notice, Prisma } from '@prisma/client';

const database = await DatabaseClient.build();

/**
 * Upsert notice by id. Example request: /api/notice/:id
 * @param {ALBEvent} event
 * @returns  {Promise<ALBResult>} JSON stringified object of contents inside body
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const id = event.path.split('/').pop();
    const user = await getUser(event);
    validateAdminUser(user);

    const { title, content, publishTimeStart, publishTimeEnd, showAsBanner }: Notice = JSON.parse(event.body as string);

    log.info(user, 'Update notice by id ' + id);
    devLog.info(content);

    const notice = await database.notice.update({
      where: {
        id,
      },
      data: {
        title,
        content,
        publishTimeStart,
        publishTimeEnd,
        showAsBanner,
        authorId: user.uid,
      } as Prisma.NoticeCreateInput,
    });

    log.info(user, 'Notice updated ' + notice.id);

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
