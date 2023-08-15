import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';
import { findEndpoint, getAlfrescoOptions } from '../../utils/alfresco';
import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log, auditLog } from '../../utils/logger';
import { getUser, validateReadUser, validateWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { folderDeleteRequestBuilder } from './fileRequestBuilder';
import { deleteComponent } from '../database/components/delete-node-component';
import { alfrescoApiVersion, alfrescoAxios } from '../../utils/axios';
import { AxiosRequestConfig } from 'axios';

const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

// Instead of this function, we use delete-file for folders, since alfresco node deletion API works the same for folders and files.
const deleteFolder = async (options: AxiosRequestConfig, nodeId: string) => {
  const url = `${alfrescoApiVersion}/nodes/${nodeId}`;
  const response = await alfrescoAxios.delete(url, options);
  return response.data;
};

/**
 * Delete Alfresco node (in this case folder). Example: /api/alfresco/file/linjakaaviot/FOO-123-AAA
 * @param {ALBEvent} event
 * @param {{string}} event.path Path should include category and node id of the folder to delete
 * @returns  {Promise<ALBResult>} JSON stringified object of deleted folder
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult | undefined> {
  try {
    const paths = event.path.split('/');
    const nodeId = paths.at(-1);
    const category = paths.at(-2);

    const user = await getUser(event);
    log.info(user, `Deleting folder from ${category}`);
    validateReadUser(user);

    if (!category) {
      throw new RataExtraLambdaError('Category missing from path', 400);
    }
    if (!nodeId) {
      throw new RataExtraLambdaError('NodeId missing from path', 400);
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
      throw new RataExtraLambdaError('Folder cannot be deleted', 403);
    }

    const writeRole = categoryData.writeRights;
    validateWriteUser(user, writeRole);

    const headers = (await getAlfrescoOptions(user.uid)).headers;
    const requestOptions = (await folderDeleteRequestBuilder(headers)) as AxiosRequestConfig;

    const alfrescoResult = await deleteFolder(requestOptions, nodeId);
    if (!alfrescoResult) {
      throw new RataExtraLambdaError('Error deleting folder from Alfresco', 404);
    }

    // TODO at some later time
    /* const databaseResult = await deleteComponent(nodeId);
    if (!databaseResult) {
      throw new RataExtraLambdaError('Error deleting folder from database', 404);
    } */

    auditLog.info(user, `Deleted folder ${nodeId} in ${categoryData.alfrescoFolder}`);

    return {
      statusCode: 204,
      headers: { 'Content-Type:': 'application/json' },
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
}
