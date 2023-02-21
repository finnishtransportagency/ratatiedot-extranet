import axios, { AxiosResponse } from 'axios';

export interface FileData {
  name: string;
  description: string;
  parentNode: string;
}

export const uploadFile = async (file: File, fileData: FileData): Promise<AxiosResponse> => {
  const { name, parentNode, description } = fileData;
  let response = null;
  if (file) {
    const form = new FormData();
    form.append('name', name);
    form.append('filedata', file);
    form.append('nodeType', 'cm:content');
    const options = {
      method: 'POST',
      body: form,
    };
    response = await axios(`/api/alfresco/file/${parentNode}`, options);
  }
  return response as any;
};
