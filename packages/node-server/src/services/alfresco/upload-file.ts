import { CategoryDataBase } from '@prisma/client';
import { Request } from 'express';
import lodash from 'lodash';
import { findEndpoint, getAlfrescoOptions } from '../../utils/alfresco.js';
import { RataExtraEC2Error, getRataExtraEC2Error } from '../../utils/errors.js';
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

export const isFolderInCategory = async (folderPath: string, category: string) => {
  // Split the path into its components
  const pathComponents = folderPath.split('/');

  // Check if the parent folder name is among the path components
  // Adjust the index based on given path structure
  // e.g. /Company Home/Sites/ratat-extra/documentLibrary/hallintaraportit -> ['', 'Company Home', 'Sites', 'ratat-extra', 'documentLibrary', 'hallintaraportit']
  return pathComponents[5] === category;
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
  body: string | undefined;
};

/**
 * Upload custom content for page. Example request: /api/alfresco/file/linjakaaviot/{NODE_ID}
 * @param {ALBEvent} request
 * @param {{string}} event.path Path should end with the page to upload the file to
 * @param {{string}} event.body File contents and metadata to upload
 * @returns  {Promise<ALBResult>} JSON stringified object of uploaded file metadata
 */
export async function handleRequest(req: Request): Promise<UploadResponse | undefined> {
  try {
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
      const folderPath = lodash.get(foundFolder, 'entry.path.name', '');
      // Check if the nest folder is a descendant of the category
      const isFolderDescendantOfCategory = await isFolderInCategory(folderPath, category);
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
      body: JSON.stringify(result),
    };
  } catch (err) {
    log.error(err);
    if (err.statusCode === 409) {
      throw new RataExtraEC2Error('File already exists', 409, 'fileAlreadyExists');
    }
    return getRataExtraEC2Error(err);
  }
}

export default handleRequest;
