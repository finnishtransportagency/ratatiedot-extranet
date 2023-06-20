import axios, { AxiosResponse } from 'axios';

export interface FileData {
  name: string;
  description: string;
  categoryName: string;
  nestedFolderId?: string;
}

export const uploadFile = async (file: File, fileData: FileData): Promise<AxiosResponse> => {
  const { name, categoryName, nestedFolderId, description } = fileData;
  let response = null;
  if (file) {
    const form = new FormData();
    form.append('name', name);
    form.append('filedata', file);
    form.append('nodeType', 'cm:content');
    if (description) form.append('cm:description', description);
    const options = {
      method: 'POST',
      data: form,
      headers: {
        'content-type': 'multipart/form-data',
      },
    };
    const originalUrl = `/api/alfresco/file/${categoryName}`;
    const nestedFolderUrl = `/api/alfresco/file/${categoryName}/${nestedFolderId}`;
    response = await axios(nestedFolderId ? nestedFolderUrl : originalUrl, options);
  }
  return response as any;
};
