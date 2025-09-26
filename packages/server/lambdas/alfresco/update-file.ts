import * as Sentry from '@sentry/aws-serverless';
import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';
import { isEmpty } from 'lodash';
import { findEndpoint, getAlfrescoOptions } from '../../utils/alfresco';
import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log, auditLog } from '../../utils/logger';
import { getUser, validateReadUser, validateWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { updateFileRequestBuilder } from './fileRequestBuilder';
import { AlfrescoResponse } from './fileRequestBuilder/types';
import { alfrescoApiVersion, alfrescoAxios } from '../../utils/axios';
import { AxiosRequestConfig } from 'axios';
import { handlerWrapper } from '../handler-wrapper';

const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

const updateFile = async (
  options: AxiosRequestConfig,
  nodeId: string,
  newFileName?: string,
): Promise<AlfrescoResponse | undefined> => {
  let url = `${alfrescoApiVersion}/nodes/${nodeId}/content`;
  if (newFileName) {
    url = url.concat(`&name=${newFileName}`);
  }
  const response = await alfrescoAxios.put(url, options);
  return response.data;
};

/**
 * Update file content. Example request: /api/alfresco/file/linjakaaviot/FOO-123-AAA/content
 * @param {ALBEvent} event
 * @param {{string}} event.path Path should end with the page to upload the file to
 * @param {{string}} event.body File contents and metadata to upload
 * @returns  {Promise<ALBResult>} JSON stringified object of uploaded file metadata
 */
export const handleRequest = handlerWrapper(async (event: ALBEvent): Promise<ALBResult | undefined> => {
  try {
    const paths = event.path.split('/');
    const nodeId = paths.at(-2);
    const category = paths.at(-3);
    const name = event.queryStringParameters?.name;

    const user = await getUser(event);
    log.info(user, `Updating file ${nodeId} in ${category}`);
    validateReadUser(user);

    if (!category) {
      throw new RataExtraLambdaError('Category missing from path', 400);
    }
    if (!nodeId) {
      throw new RataExtraLambdaError('Node ID missing from path', 400);
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

    const headers = (await getAlfrescoOptions(user.uid)).headers;
    const requestOptions = (await updateFileRequestBuilder(event, headers)) as AxiosRequestConfig;

    const result = await updateFile(requestOptions, nodeId, name);
    auditLog.info(user, `Updated file ${nodeId} in ${categoryData.alfrescoFolder}`);
    return {
      statusCode: 200,
      headers: { 'Content-Type:': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (err) {
    log.error(err);
    Sentry.captureException(err);
    return getRataExtraLambdaError(err);
  }
});
