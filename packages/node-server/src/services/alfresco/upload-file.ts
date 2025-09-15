import { CategoryDataBase } from '@prisma/client';
import { Request } from 'express';
import lodash from 'lodash';
import { findEndpoint, getAlfrescoOptions } from '../../utils/alfresco.js';
import { RataExtraEC2Error } from '../../utils/errors.js';
import { log, auditLog } from '../../utils/logger.js';
import { getUser, validateReadUser, validateWriteUser } from '../../utils/userService.js';
import { DatabaseClient } from '../database/client/index.js';
import { fileRequestBuilder } from './fileRequestBuilder/index.js';
import { AlfrescoResponse } from './fileRequestBuilder/types.js';
import FormData from 'form-data';

import { alfrescoApiVersion, alfrescoAxios } from '../../utils/axios.js';

// Copied from alfresco/list-files
export const getFolder = async (uid: string, nodeId: string) => {
  try {
    const url = `${alfrescoApiVersion}/nodes/${nodeId}?where=(isFolder=true)&include=path`;
    const options = await getAlfrescoOptions(uid, { 'Content-Type': 'application/json;charset=UTF-8' });
    const response = await alfrescoAxios.get(url, options);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

export const isFolderInCategory = (folderPathInfo: unknown, categoryAlfrescoId: string): boolean => {
  // The path object from Alfresco API should contain an array of elements with both id and name
  // We check if any element in the path has the category's Alfresco node ID
  if (folderPathInfo && typeof folderPathInfo === 'object' && 'elements' in folderPathInfo) {
    const pathElements = folderPathInfo.elements;
    if (Array.isArray(pathElements)) {
      return pathElements.some(
        (element: unknown) =>
          element && typeof element === 'object' && 'id' in element && element.id === categoryAlfrescoId,
      );
    }
  }

  // Fallback: if we only have path name string, check if the category node ID is in the path
  if (typeof folderPathInfo === 'string') {
    return folderPathInfo.includes(categoryAlfrescoId);
  }

  return false;
};

// End copy from list-files

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
  const res = await alfrescoAxios.post(url, options.body, { headers, timeout: 60000 });
  return res.data;
};

type UploadResponse = {
  statusCode: number;
  headers: Record<string, string | undefined>;
  body: AlfrescoResponse;
};

/**
 * Upload custom content for page. Example request: /api/alfresco/file/linjakaaviot/{NODE_ID}
 * @param {ALBEvent} request
 * @param {{string}} event.path Path should end with the page to upload the file to
 * @param {{string}} event.body File contents and metadata to upload
 * @returns  {Promise<ALBResult>} JSON stringified object of uploaded file metadata
 */
export async function handleRequest(req: Request): Promise<UploadResponse | undefined> {
  const paths = req.path.split('/');
  const category = req.params.category;
  const nestedFolderId = req.params.nestedFolderId as string;

  const user = await getUser(req);
  log.info(
    user,
    `Uploading files for ${
      nestedFolderId ? `nested folder id ${nestedFolderId} belonging to page ${category}` : `page ${category}`
    }`,
  );

  validateReadUser(user);
  if (!category || paths.at(3) !== 'file') {
    throw new RataExtraEC2Error('Category missing from path', 400);
  }
  if (lodash.isEmpty(req.body)) {
    throw new RataExtraEC2Error('Request body missing', 400);
  }
  if (!fileEndpointsCache.length) {
    fileEndpointsCache = await database.categoryDataBase.findMany();
  }
  const categoryData = findEndpoint(category, fileEndpointsCache);
  if (!categoryData) {
    throw new RataExtraEC2Error('Category not found', 404);
  }
  const hasClassifiedContent = categoryData.hasClassifiedContent;
  if (hasClassifiedContent) {
    throw new RataExtraEC2Error('File cannot be uploaded', 403);
  }

  const writeRole = categoryData.writeRights;
  validateWriteUser(user, writeRole);
  let targetNode;
  if (nestedFolderId) {
    const foundFolder = await getFolder(user.uid, nestedFolderId);
    const folderPath = lodash.get(foundFolder, 'entry.path', '');
    // Check if the nest folder is a descendant of the category
    const isFolderDescendantOfCategory = isFolderInCategory(folderPath, categoryData.alfrescoFolder);
    if (!isFolderDescendantOfCategory) {
      throw new RataExtraEC2Error('Folder cannot be found in category', 404);
    }
    targetNode = nestedFolderId;
  } else {
    targetNode = categoryData.alfrescoFolder;
  }
  const headers = (await getAlfrescoOptions(user.uid)).headers;
  const requestOptions = (await fileRequestBuilder(req, headers)) as AxiosRequestOptions;
  const result = await postFile(requestOptions, targetNode);

  auditLog.info(
    user,
    `Uploaded file ${result?.entry.name} with id ${result?.entry.id} to ${categoryData.alfrescoFolder}`,
  );
  return {
    statusCode: 200,
    headers: { 'Content-Type:': 'application/json' },
    body: result,
  };
}

export default handleRequest;
