import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';
import { findEndpoint, getAlfrescoOptions } from '../../utils/alfresco';
import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log, auditLog } from '../../utils/logger';
import { getUser, validateReadUser, validateWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { deleteFileRequestBuilder } from './fileRequestBuilder';
import { AlfrescoResponse } from './fileRequestBuilder/types';
import { alfrescoApiVersion, alfrescoAxios } from '../../utils/axios';
import { AxiosRequestConfig } from 'axios';

const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

// TODO: this function is also used to delete folders, we should revise these functions and their use-cases
const deleteFile = async (
  options: AxiosRequestConfig,
  nodeId: string,
): Promise<AlfrescoResponse | undefined | string> => {
  const url = `${alfrescoApiVersion}/nodes/${nodeId}`;
  const response = await alfrescoAxios.delete(url, options);
  return response.data as AlfrescoResponse;
};

/**
 * Delete file. Example request: /api/alfresco/file/linjakaaviot/FOO-123-AAA
 * @param {ALBEvent} event
 * @param {{string}} event.path Path should end with the page to upload the file to
 * @param {{string}} event.body File contents and metadata to upload
 * @returns  {Promise<ALBResult>} JSON stringified object of uploaded file metadata
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult | undefined> {
  try {
    const paths = event.path.split('/');
    const nodeId = paths.at(-1);
    const category = paths.at(-2);

    const user = await getUser(event);
    log.info(user, `Deleting file ${nodeId} in ${category}`);
    validateReadUser(user);

    if (!category) {
      throw new RataExtraLambdaError('Category missing from path', 400);
    }
    if (!nodeId) {
      throw new RataExtraLambdaError('Node ID missing from path', 400);
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
      throw new RataExtraLambdaError('File cannot be deleted', 403);
    }

    const writeRole = categoryData.writeRights;
    validateWriteUser(user, writeRole);

    const headers = (await getAlfrescoOptions(user.uid)).headers;
    const requestOptions = deleteFileRequestBuilder(headers) as AxiosRequestConfig;

    const result = await deleteFile(requestOptions, nodeId);
    auditLog.info(user, `Deleted file ${nodeId} in ${categoryData.alfrescoFolder}`);
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
