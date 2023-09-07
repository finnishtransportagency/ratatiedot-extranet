import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';
import { get, isEmpty } from 'lodash';
import { findEndpoint, getAlfrescoOptions } from '../../utils/alfresco';
import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { auditLog, log } from '../../utils/logger';
import { getUser, validateReadUser, validateWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { folderCreateRequestBuilder } from './fileRequestBuilder';
import { AlfrescoResponse } from './fileRequestBuilder/types';
import { alfrescoApiVersion, alfrescoAxios } from '../../utils/axios';
import { AxiosRequestConfig } from 'axios';
import { getFolder, isFolderInCategory } from './list-files';
import { getNodes } from './list-nodes';

const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

export interface AxiosRequestOptions extends AxiosRequestConfig {
  body: {
    [key: string]: unknown;
  };
}

const postFolder = async (options: AxiosRequestOptions, nodeId: string): Promise<AlfrescoResponse | undefined> => {
  const url = `${alfrescoApiVersion}/nodes/${nodeId}/children`;
  const headers = {
    ...options.headers,
  };
  const response = await alfrescoAxios.post(url, options.body, { headers });
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
    const category = paths.at(4);
    const nestedFolderId = paths.at(5);

    const user = await getUser(event);
    log.info(
      user,
      `Creating a new folder to ${
        nestedFolderId ? `nested folder id ${nestedFolderId} belonging to page ${category}` : `page ${category}`
      }`,
    );
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

    let targetNode;
    if (nestedFolderId) {
      const foundFolder = await getFolder(user.uid, nestedFolderId);
      const folderPath = get(foundFolder, 'entry.path.name', '');
      // Check if the nest folder is a descendant of the category
      const isFolderDescendantOfCategory = await isFolderInCategory(folderPath, category);
      if (!isFolderDescendantOfCategory) {
        throw new RataExtraLambdaError('Folder cannot be found in category', 404);
      }
      targetNode = nestedFolderId;
    } else {
      targetNode = categoryData.alfrescoFolder;
    }

    const options = await getAlfrescoOptions(user.uid);
    const requestOptions = (await folderCreateRequestBuilder(event, options.headers)) as unknown as AxiosRequestOptions;

    const folderName = JSON.parse(event.body).name;
    const nodes = await getNodes(targetNode, options);

    const nodeAlreadyExists = nodes?.data.list.entries.some((node: AlfrescoResponse) => node.entry.name === folderName);

    let alfrescoResult;

    if (nodeAlreadyExists) {
      throw new RataExtraLambdaError('Folder already exists', 409, 'nodeAlreadyExists');
    } else {
      alfrescoResult = await postFolder(requestOptions, targetNode);
    }

    if (!alfrescoResult) {
      throw new RataExtraLambdaError('Error creating folder', 500);
    }

    // TODO at some later time
    //const result = await createFolderComponent(categoryData.id, alfrescoResult);

    auditLog.info(user, `Created folder with id: ${JSON.stringify(alfrescoResult?.entry.id)}`);

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
