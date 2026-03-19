import type { CategoryDataBase } from '../../generated/prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';
import { isEmpty } from 'lodash';
import { findEndpoint, getAlfrescoOptions } from '../../utils/alfresco';
import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log, auditLog } from '../../utils/logger';
import { getUser, validateReadUser, validateWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { updateFileMetadataRequestBuilder } from './fileRequestBuilder';
import { AlfrescoResponse } from './fileRequestBuilder/types';
import { alfrescoApiVersion, alfrescoAxios } from '../../utils/axios';
import { AxiosRequestOptions } from './create-folder';

const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

const updateFileMetadata = async (
  options: AxiosRequestOptions,
  nodeId: string,
): Promise<AlfrescoResponse | undefined> => {
  const url = `${alfrescoApiVersion}/nodes/${nodeId}`;
  const headers = {
    ...options.headers,
  };
  const response = await alfrescoAxios.put(url, options.body, { headers });

  return response.data;
};

/**
 * Update file metadata. Example request: /api/alfresco/file/linjakaaviot/AAA-123-BBB
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

    const options = await getAlfrescoOptions(user.uid);
    const requestOptions = updateFileMetadataRequestBuilder(event, options.headers) as unknown as AxiosRequestOptions;

    const result = await updateFileMetadata(requestOptions, nodeId);
    auditLog.info(user, `Updated file ${nodeId} in ${categoryData.alfrescoFolder}`);
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
