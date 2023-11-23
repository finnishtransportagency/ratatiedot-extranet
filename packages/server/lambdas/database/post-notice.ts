import { ALBEvent, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError } from '../../utils/errors';
import { devLog, log } from '../../utils/logger';
import { getUser, validateAdminUser } from '../../utils/userService';
import { DatabaseClient } from './client';
import { Notice, Prisma } from '@prisma/client';

const database = await DatabaseClient.build();

/**
 * Create new notice. Example request: /api/notice
 * @param {ALBEvent} event
 * @returns  {Promise<ALBResult>} JSON stringified object of contents inside body
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const user = await getUser(event);
    validateAdminUser(user);

    const { title, content, publishTimeStart, publishTimeEnd, showAsBanner }: Notice = JSON.parse(event.body as string);

    log.info(user, 'Add new notice');
    devLog.info(content);

    const notice = await database.notice.create({
      data: {
        title,
        content: content,
        publishTimeStart,
        publishTimeEnd,
        showAsBanner,
        authorId: user.uid,
      } as Prisma.NoticeCreateInput,
    });

    log.info(user, 'New notice created ' + notice.id);

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
