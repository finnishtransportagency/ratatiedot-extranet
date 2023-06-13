import { RequestInit } from 'node-fetch';
import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';
import { isEmpty } from 'lodash';
import { findEndpoint, getAlfrescoOptions } from '../../utils/alfresco';
import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { auditLog, log } from '../../utils/logger';
import { getUser, validateReadUser, validateWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { folderCreateRequestBuilder } from './fileRequestBuilder';
import { AlfrescoResponse } from './fileRequestBuilder/types';
import { createFolderComponent } from '../database/components/create-node-component';
import { alfrescoAxios } from '../../utils/axios';
import { AxiosRequestConfig } from 'axios';

const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

const postFolder = async (options: AxiosRequestConfig, nodeId: string): Promise<AlfrescoResponse | undefined> => {
  const url = `/alfresco/versions/1/nodes/${nodeId}/children`;
  const response = await alfrescoAxios.post(url, options);
  return response.data as AlfrescoResponse;
};

/**
 * Create new Alfresco node (in this case folder). Example request: /api/alfresco/folder/linjakaaviot
 * @param {ALBEvent} event
 * @param {{string}} event.path Path should end with the page to upload the file to
 * @param {{string}} event.body Folder name and other metadata
 * @returns  {Promise<ALBResult>} JSON stringified object of uploaded file metadata
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult | undefined> {
  try {
    const paths = event.path.split('/');
    const category = paths.pop();

    const user = await getUser(event);
    log.info(user, `Creating new folder in page ${category}`);
    validateReadUser(user);

    if (!category) {
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

    const hasClassifiedContent = categoryData.hasClassifiedContent;
    if (hasClassifiedContent) {
      throw new RataExtraLambdaError('Folder cannot be created', 403);
    }

    const writeRole = categoryData.writeRights;
    validateWriteUser(user, writeRole);

    const headers = (await getAlfrescoOptions(user.uid)).headers;
    const requestOptions = (await folderCreateRequestBuilder(event, headers)) as AxiosRequestConfig;

    const alfrescoResult = await postFolder(requestOptions, categoryData.alfrescoFolder);
    if (!alfrescoResult) {
      throw new RataExtraLambdaError('Error creating folder', 500);
    }

    const result = await createFolderComponent(categoryData.id, alfrescoResult);

    auditLog.info(user, `Created folder with id: ${JSON.stringify(alfrescoResult?.entry.id)}`);

    return {
      statusCode: 200,
      headers: { 'Content-Type:': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
