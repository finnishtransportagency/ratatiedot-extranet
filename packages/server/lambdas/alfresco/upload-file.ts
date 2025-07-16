import { CategoryDataBase } from '@prisma/client';
import { ALBEvent, ALBResult } from 'aws-lambda';
import { get, isEmpty } from 'lodash';
import { findEndpoint, getAlfrescoOptions } from '../../utils/alfresco';
import { getRataExtraLambdaError, RataExtraLambdaError } from '../../utils/errors';
import { log, auditLog } from '../../utils/logger';
import { getUser, validateReadUser, validateWriteUser } from '../../utils/userService';
import { DatabaseClient } from '../database/client';
import { fileRequestBuilder } from './fileRequestBuilder';
import { AlfrescoResponse } from './fileRequestBuilder/types';
import { getFolder, isNodeInCategory } from './list-files';
import FormData from 'form-data';

import { alfrescoApiVersion, alfrescoAxios } from '../../utils/axios';
import { handlerWrapper } from '../handler-wrapper';

const database = await DatabaseClient.build();

let fileEndpointsCache: Array<CategoryDataBase> = [];

export interface AxiosRequestOptions {
  method: string;
  body: FormData;
  headers: { [name: string]: string };
}

const postFile = async (options: AxiosRequestOptions, nodeId: string): Promise<AlfrescoResponse | undefined> => {
  const url = `${alfrescoApiVersion}/nodes/${nodeId}/children`;
  const headers = {
    ...options.headers,
  };
  const res = await alfrescoAxios.post(url, options.body, { headers });
  return res.data;
};

/**
 * Upload custom content for page. Example request: /api/alfresco/file/linjakaaviot/{NODE_ID}
 * @param {ALBEvent} event
 * @param {{string}} event.path Path should end with the page to upload the file to
 * @param {{string}} event.body File contents and metadata to upload
 * @returns  {Promise<ALBResult>} JSON stringified object of uploaded file metadata
 */
export const handleRequest = handlerWrapper(async (event: ALBEvent): Promise<ALBResult | undefined> => {
  try {
    const paths = event.path.split('/');
    const category = paths.at(4);
    const nestedFolderId = paths.at(5);

    const user = await getUser(event);
    log.info(
      user,
      `Uploading files for ${
        nestedFolderId ? `nested folder id ${nestedFolderId} belonging to page ${category}` : `page ${category}`
      }`,
    );

    validateReadUser(user);

    if (!category || paths.at(3) !== 'file') {
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
      throw new RataExtraLambdaError('File cannot be uploaded', 403);
    }

    const writeRole = categoryData.writeRights;
    validateWriteUser(user, writeRole);

    let targetNode;
    if (nestedFolderId) {
      const foundFolder = await getFolder(user.uid, nestedFolderId);
      const folderPath = get(foundFolder, 'entry.path.name', '');
      // Check if the nest folder is a descendant of the category
      const isFolderDescendantOfCategory = await isNodeInCategory(folderPath, category);
      if (!isFolderDescendantOfCategory) {
        throw new RataExtraLambdaError('Folder cannot be found in category', 404);
      }
      targetNode = nestedFolderId;
    } else {
      targetNode = categoryData.alfrescoFolder;
    }

    const headers = (await getAlfrescoOptions(user.uid)).headers;
    const requestOptions = (await fileRequestBuilder(event, headers)) as AxiosRequestOptions;
    const result = await postFile(requestOptions, targetNode);

    auditLog.info(
      user,
      `Uploaded file ${result?.entry.name} with id ${result?.entry.id} to ${categoryData.alfrescoFolder}`,
    );
    return {
      statusCode: 200,
      headers: { 'Content-Type:': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (err) {
    log.error(err);
    return getRataExtraLambdaError(err);
  }
});
