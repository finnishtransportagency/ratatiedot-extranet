const AWS = require('aws-sdk'); //eslint-disable-line @typescript-eslint/no-var-requires
import { ALBEvent, ALBEventHeaders, ALBResult } from 'aws-lambda';

import { getRataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateAdminUser } from '../../utils/userService';
import { DatabaseClient } from './client';
import { Notice, Prisma } from '@prisma/client';
import { FileInfo } from 'busboy';
import { randomUUID } from 'crypto';
import path from 'path';
import { parseForm } from '../../utils/parser';
import { base64ToBuffer } from '../alfresco/fileRequestBuilder/alfrescoRequestBuilder';

const database = await DatabaseClient.build();
const s3 = new AWS.S3();
const RATAEXTRA_STACK_IDENTIFIER = process.env.RATAEXTRA_STACK_IDENTIFIER;

/**
 * Create new notice. Example request: /api/notice
 * @param {ALBEvent} event
 * @returns  {Promise<ALBResult>} JSON stringified object of contents inside body
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
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
    const sanitizedFilename = `${randomUUID()}${fileExtension}`;

    console.log('formData.notice', formData.notice);

    const { title, content, publishTimeStart, publishTimeEnd, showAsBanner }: Notice = JSON.parse(
      formData.notice as string,
    );

    console.log(title, content, publishTimeStart, publishTimeEnd, showAsBanner);

    const params = {
      Bucket: `s3-${RATAEXTRA_STACK_IDENTIFIER}-images`,
      Key: sanitizedFilename,
      Body: fileData,
      ACL: 'private',
    };

    await s3.upload(params).promise();
    //const imageUrl = `https://${RATAEXTRA_STACK_IDENTIFIER}-images.s3.eu-west-1.amazonaws.com/${sanitizedFilename}`;

    log.info(user, 'Add new notice');

    /* let updatedContent;
    if (Array.isArray(content)) {
      updatedContent = content.map((element) => {
        if (element.type === 'image') {
          return { ...element, url: imageUrl };
        }
        return element;
      });
    } else {
      updatedContent = content;
    } */

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
