import { ALBEvent, ALBEventHeaders, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateAdminUser } from '../../utils/userService';
import { DatabaseClient } from './client';
import { Prisma } from '@prisma/client';
import { FileInfo } from 'busboy';
import { parseForm } from '../../utils/parser';
import { uploadToS3 } from '../../utils/s3utils';
import { base64ToBuffer } from '../alfresco/fileRequestBuilder/alfrescoRequestBuilder';
import type { NoticeWithContentArray } from '../../types';

const database = await DatabaseClient.build();
const RATAEXTRA_STACK_IDENTIFIER = process.env.RATAEXTRA_STACK_IDENTIFIER;

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

    const body = event.body ?? '';
    let buffer;
    if (event.isBase64Encoded) {
      buffer = base64ToBuffer(event.body as string);
    }

    const formData = await parseForm(buffer ?? body, event.headers as ALBEventHeaders);
    const fileData: Buffer = formData.filedata as Buffer;

    let filename = '';
    if (formData.fileinfo) {
      const fileInfo = formData.fileinfo as FileInfo;
      filename = `images/${Date.now()}_${fileInfo.filename}`;
    }

    const { title, content, publishTimeStart, publishTimeEnd, showAsBanner }: NoticeWithContentArray = JSON.parse(
      formData.notice as string,
    );

    const imageElement = content.find((element) => element.type === 'image');

    // If we receive a new image, upload it to S3
    if (fileData) {
      const bucket = `s3-${RATAEXTRA_STACK_IDENTIFIER}-images`;
      await uploadToS3(bucket, filename, fileData);
      if (imageElement) {
        imageElement.url = filename;
      }
    }

    log.info(user, 'Update notice by id ' + id);

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
