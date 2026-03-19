import type { CategoryDataBase } from '../../generated/prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';
import { isEmpty } from 'lodash';
import { findEndpoint, getAlfrescoOptions } from '../../utils/alfresco';
import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log, auditLog } from '../../utils/logger';
import { getUser, validateReadUser, validateWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { getAlfrescoId, updateFolderComponent } from '../database/components/update-node-component';
import { folderUpdateRequestBuilder } from './fileRequestBuilder';
import { AlfrescoResponse } from './fileRequestBuilder/types';
import { alfrescoApiVersion, alfrescoAxios } from '../../utils/axios';
import { AxiosRequestConfig } from 'axios';

const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

const updateFolder = async (nodeId: string, options: AxiosRequestConfig): Promise<AlfrescoResponse | undefined> => {
  const url = `${alfrescoApiVersion}/nodes/${nodeId}`;
  const response = await alfrescoAxios.put(url, options);
  return response.data;
};

/**
 * Update Alfresco node metadata (in this case folder). Example request: /api/alfresco/folder/linjakaaviot/{NODE_ID}
 * @param {ALBEvent} event
 * @param {{string}} event.path Path should include the name of the page and the node id to update
 * @param {{string}} event.body Folder name and other metadata
 * @returns  {Promise<ALBResult>} JSON stringified object of updated folder
 */
export async function handleRequest(event: ALBEvent): Promise<ALBResult | undefined> {
  try {
    const paths = event.path.split('/');
    const componentId = paths.at(-1) as string;
    const category = paths.at(-2);

    const user = await getUser(event);
    log.info(user, `Updating new folder in page ${category}`);
    validateReadUser(user);

    if (!category) {
      throw new RataExtraLambdaError('Category missing from path', 400);
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

    const headers = (await getAlfrescoOptions(user.uid)).headers;
    const requestOptions = (await folderUpdateRequestBuilder(event, headers)) as AxiosRequestConfig;

    const alfrescoId = await getAlfrescoId(componentId);
    if (!alfrescoId) {
      throw new RataExtraLambdaError('Id did not mach any component', 404);
    }

    const result = await updateFolder(alfrescoId, requestOptions);
    await updateFolderComponent(componentId, { title: JSON.parse(event.body).name });

    auditLog.info(user, `Updated folder ${alfrescoId} metadata in ${categoryData.alfrescoFolder}`);

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
