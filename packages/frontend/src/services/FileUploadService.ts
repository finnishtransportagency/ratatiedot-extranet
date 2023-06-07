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
    const options = {
      method: 'POST',
      data: form,
      headers: {
        'content-type': 'multipart/form-data',
      },
    };
    response = await axios(
      `/api/alfresco/file/${nestedFolderId ? `${categoryName}/${nestedFolderId}` : categoryName}`,
      options,
    );
  }
  return response as any;
};
