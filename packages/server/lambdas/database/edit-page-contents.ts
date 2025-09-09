import * as Sentry from '@sentry/aws-serverless';
import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, ALBEventHeaders, ALBResult } from 'aws-lambda';
import { findEndpoint } from '../../utils/alfresco';

import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log, auditLog } from '../../utils/logger';
import { getUser, validateReadUser, validateWriteUser } from '../../utils/userService';
import { DatabaseClient } from './client';
import { Prisma } from '@prisma/client';
import { isEmpty } from 'lodash';
import { handlePrismaError, PrismaError } from './error/databaseError';
import { FileInfo } from 'busboy';
import { parseForm } from '../../utils/parser';
import { uploadToS3 } from '../../utils/s3utils';
import { base64ToBuffer } from '../alfresco/fileRequestBuilder/alfrescoRequestBuilder';
import { handlerWrapper } from '../handler-wrapper';

const database = await DatabaseClient.build();
const RATAEXTRA_STACK_IDENTIFIER = process.env.RATAEXTRA_STACK_IDENTIFIER;

let fileEndpointsCache: Array<CategoryDataBase> = [];

/**
 * Edit page content. Example request: /api/database/page-contents/linjakaaviot
 * @param {ALBEvent} event
 * @param {{string}} event.path Path should end with the page to get the custom content for
 * @returns  {Promise<ALBResult>} JSON stringified object of contents inside body
 */
export const handleRequest = handlerWrapper(async (event: ALBEvent): Promise<ALBResult> => {
  try {
    const paths = event.path.split('/');
    const category = paths.pop();

    const user = await getUser(event);
    log.info(user, `Updating page contents: ${category}`);
    validateReadUser(user);

    if (isEmpty(event.body) || event.body === null) {
      throw new RataExtraLambdaError('Request body missing', 400);
    }

    if (!category || paths.pop() !== 'page-contents') {
      throw new RataExtraLambdaError('Category missing from path', 400);
    }
    if (!fileEndpointsCache.length) {
      log.debug('Cache empty');
      fileEndpointsCache = await database.categoryDataBase.findMany();
    }
    log.debug(`Cached ${JSON.stringify(fileEndpointsCache)}`);
    const categoryData = findEndpoint(category, fileEndpointsCache);
    if (!categoryData) {
      throw new RataExtraLambdaError('Category not found', 404);
    }

    const writeRole = categoryData.writeRights;
    validateWriteUser(user, writeRole);

    const whereClause = Prisma.validator<Prisma.CategoryDataContentsWhereInput>()({
      baseId: categoryData.id,
    });

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

    const pagecontent = JSON.parse(formData.pagecontent as string);

    const imageElement = pagecontent.find((element) => element.type === 'image');

    // If we receive a new image, upload it to S3
    if (fileData) {
      const bucket = `s3-${RATAEXTRA_STACK_IDENTIFIER}-images`;
      await uploadToS3(bucket, filename, fileData);
      if (imageElement) {
        imageElement.url = filename;
      }
    }

    const dataClause = Prisma.validator<Prisma.CategoryDataContentsUpdateInput>()({
      fields: pagecontent,
    });

    const updateContent = async () => {
      try {
        return await database.categoryDataContents.update({
          where: whereClause,
          data: dataClause,
        });
      } catch (error) {
        handlePrismaError(error as PrismaError);
      }
    };

    const updatedContent = await updateContent();
    auditLog.info(user, `Updated page contents: ${category}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: updatedContent?.fields }),
    };
  } catch (err) {
    log.error(err);
    Sentry.captureException(err);
    return getRataExtraLambdaError(err);
  }
});
