import { ALBEvent, ALBEventHeaders, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError } from '../../utils/errors';
import { devLog, log } from '../../utils/logger';
import { getUser, validateAdminUser } from '../../utils/userService';
import { DatabaseClient } from './client';
import { Notice, Prisma } from '@prisma/client';
import { FileInfo } from 'busboy';
import { randomUUID } from 'crypto';
import path from 'path';
import { parseForm } from '../../utils/parser';
import { uploadToS3 } from '../../utils/s3utils';
import { base64ToBuffer } from '../alfresco/fileRequestBuilder/alfrescoRequestBuilder';

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
    const fileInfo = formData.fileinfo as FileInfo;

    const fileExtension = path.extname(fileInfo.filename);
    const sanitizedFilename = `images/${randomUUID()}${fileExtension}`;

    const { title, content, publishTimeStart, publishTimeEnd, showAsBanner }: Notice = JSON.parse(
      formData.notice as string,
    );

    const existingNotice = await database.notice.findUnique({ where: { id } });

    const imageElement = content.find((element) => element.type === 'image');

    // If we receive a new image, upload it to S3
    if (fileData) {
      const bucket = `s3-${RATAEXTRA_STACK_IDENTIFIER}-images`;
      await uploadToS3(bucket, sanitizedFilename, fileData);
      if (imageElement) {
        imageElement.url = sanitizedFilename;
      }
    }

    // Check if the image is the same as the existing one, if not, upload it to S3
    if (imageElement) {
      const existingImageElement = existingNotice.content.find((element) => element.type === 'image');
      if (existingImageElement && existingImageElement.url !== imageElement.url) {
        const bucket = `s3-${RATAEXTRA_STACK_IDENTIFIER}-images`;
        await uploadToS3(bucket, sanitizedFilename, fileData);
      }
    }

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
