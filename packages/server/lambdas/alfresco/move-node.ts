import type { CategoryDataBase } from '../../generated/prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';
import { get, isEmpty } from 'lodash';
import { findEndpoint, getAlfrescoOptions } from '../../utils/alfresco';
import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { auditLog, log } from '../../utils/logger';
import { getUser, validateReadUser, validateWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { AlfrescoResponse } from './fileRequestBuilder/types';
import { alfrescoApiVersion, alfrescoAxios } from '../../utils/axios';
import { AxiosRequestOptions } from './upload-file';
import { isNodeInCategory } from './list-files';
import { getNode } from './populate-activities';

const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

const moveNode = async (options: AxiosRequestOptions, nodeId: string): Promise<AlfrescoResponse | undefined> => {
  const url = `${alfrescoApiVersion}/nodes/${nodeId}/move`;
  const headers = {
    ...options.headers,
  };
  const response = await alfrescoAxios.post(url, options.body, { headers });
  return response.data as AlfrescoResponse;
};

/**
 * Move alfresco node to another location
 * eg. /api/alfresco/files/hallintaraportit/1234/move
 * @param {ALBEvent} event
 * @param {{string}} event.path Path should end with the page to upload the file to
 * @param {{string}} event.body Folder name and other metadata
 * @returns {Promise<ALBResult>} JSON stringified object
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult | undefined> {
  try {
    const paths = event.path.split('/');
    const category = paths[4];
    const nodeId = paths[5];

    if (isEmpty(event.body) || !event.body) {
      throw new RataExtraLambdaError('Request body missing', 400);
    }

    const targetParentId = JSON.parse(event.body).targetParentId;

    const user = await getUser(event);
    log.info(user, `Moving node ${nodeId} in root category ${category} to target node ${targetParentId}`);
    validateReadUser(user);

    if (!nodeId) {
      throw new RataExtraLambdaError('nodeId missing from path', 400);
    }
    if (isEmpty(event.body) || !event.body) {
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

    const options = await getAlfrescoOptions(user.uid, { 'Content-Type': 'application/json' });

    const targetNode = await getNode(targetParentId, options, ['path']);
    const targetNodePath = get(targetNode, 'entry.path', '');

    if (!isNodeInCategory(targetNodePath, categoryData.alfrescoFolder)) {
      throw new RataExtraLambdaError('Cannot move node outside root category', 403);
    }

    const requestOptions = {
      headers: options.headers,
      body: event.body,
    } as unknown as AxiosRequestOptions;

    const alfrescoResult = await moveNode(requestOptions, nodeId);

    auditLog.info(user, `Moved node ${nodeId} in root category ${category} to target node ${targetParentId}`);

    return {
      statusCode: 200,
      headers: { 'Content-Type:': 'application/json' },
      body: JSON.stringify(alfrescoResult),
    };
  } catch (err: unknown) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
