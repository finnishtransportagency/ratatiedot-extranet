import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';
import { isEmpty } from 'lodash';
import { findEndpoint } from '../../utils/alfresco';
import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log } from '../../utils/logger';
import { getUser, validateReadUser, validateWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { fileRequestBuilder } from './fileRequestBuilder';
import fetch from 'node-fetch';
import { RequestInit } from 'node-fetch';

const database = await DatabaseClient.build();

const fileEndpointsCache: Array<CategoryDataBase> = [];

const postFile = async (options: RequestInit, nodeId: string) => {
  const url = `https://api.testivaylapilvi.fi/alfresco/api/-default-/public/alfresco/versions/1/nodes/${nodeId}/children`;
  try {
    const res = await fetch(url, options);
    const result = await res.text();
    return result;
  } catch (err) {
    console.error('error:' + err);
  }
};

/**
 * Update custom content for page. Example request: /api/alfresco/file/linjakaaviot
 * @param {ALBEvent} event
 * @param {{string}} event.path Path should end with the page to upload the file to
 * @param {{string}} event.body File contents and metadata to upload
 * @returns  {Promise<ALBResult>} JSON stringified object of uploaded file metadata
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult | undefined> {
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
      const categories = await database.categoryDataBase.findMany();
      categories.forEach((category) => {
        fileEndpointsCache.push(category);
      });
    }
    const categoryData = findEndpoint(category, fileEndpointsCache);
    if (!categoryData) {
      throw new RataExtraLambdaError('Category not found', 404);
    }

    const writeRole = categoryData.writeRights;
    validateWriteUser(user, writeRole);

    if (event.body) {
      const requestOptions = (await fileRequestBuilder(event)) as RequestInit;

      await postFile(requestOptions, categoryData.alfrescoFolder).then((result) => {
        return {
          statusCode: 200,
          headers: { 'Content-Type:': 'application/json' },
          body: JSON.stringify(result),
        };
      });
    }
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
