import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';
import { isEmpty } from 'lodash';
import { findEndpoint } from '../../utils/alfresco';
import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser, validateWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { fileRequestBuilder } from './fileRequestBuilder';
import { FormData } from 'formdata-node';
import { Blob } from 'node:buffer';

const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

const base64ToBlob = (base64string: string) => {
  const buffer = Buffer.from(base64string, 'base64');
  const blob = new Blob([buffer]);
  return blob;
};

/**
 * Update custom content for page. Example request: /api/alfresco/file/linjakaaviot
 * @param {ALBEvent} event
 * @param {{string}} event.path Path should end with the page to upload the file to
 * @param {{string}} event.body File contents and metadata to upload
 * @returns  {Promise<ALBResult>} JSON stringified object of uploaded file metadata
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult> {
  try {
    const paths = event.path.split('/');
    const category = paths.pop();

    const user = await getUser(event);
    validateReadUser(user);

    if (!category || paths.pop() !== 'file') {
      throw new RataExtraLambdaError('Category missing from path', 400);
    }
    if (isEmpty(event.body)) {
      throw new RataExtraLambdaError('Request body missing', 400);
    }
    if (!fileEndpointsCache.length) {
      fileEndpointsCache = await database.categoryDataBase.findMany();
    }
    const categoryData = findEndpoint(category, fileEndpointsCache);
    if (!categoryData) {
      throw new RataExtraLambdaError('Category not found', 404);
    }

    const writeRole = categoryData.writeRights;
    validateWriteUser(user, writeRole);
    if (event.body) {
      const blob = base64ToBlob(event.body);
      const body = new FormData();
      body.append('filedata', blob);

      const response = await fileRequestBuilder('6a1200cb-5fc9-4364-b9bb-645c64c9e31e', body);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(response),
      };
    }
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify('Hello from here'),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
