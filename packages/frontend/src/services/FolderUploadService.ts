import axios, { AxiosResponse } from 'axios';

export interface FolderData {
  name: string;
  description?: string;
  categoryName: string;
  nestedFolderId?: string;
  title?: string;
}

export interface FolderRequestOptions {
  name: string;
  nodeType: 'cm:folder';
  properties: {
    'cm:description'?: string;
    'cm:title'?: string;
  };
}

export const createEmptyFolder = async (folderData: FolderData): Promise<AxiosResponse> => {
  const { name, categoryName, nestedFolderId, description, title } = folderData;
  let response = null;
  const payload: FolderRequestOptions = {
    name,
    nodeType: 'cm:folder',
    properties: {},
  };
  if (description) payload.properties['cm:description'] = description;
  if (title) payload.properties['cm:title'] = title;
  const options = {
    method: 'POST',
    data: payload,
    headers: {
      'content-type': 'application/json',
    },
  };
  const originalUrl = `/api/alfresco/folder/${categoryName}`;
  const nestedFolderUrl = `/api/alfresco/folder/${categoryName}/${nestedFolderId}`;
  response = await axios(nestedFolderId ? nestedFolderUrl : originalUrl, options);

  return response as any;
};
