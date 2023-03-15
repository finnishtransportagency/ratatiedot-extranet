import axios, { AxiosResponse } from 'axios';

export const deleteFile = (categoryName: string, fileId: string) => {
  return axios(`/api/alfresco/file/${categoryName}/${fileId}`, { method: 'DELETE' });
};

// multiple
export const deleteFiles = async (categoryName: string, fileIds: string[]): Promise<AxiosResponse[]> => {
  const responses: AxiosResponse[] = [];
  fileIds.forEach(async (fileId) => {
    responses.push(await deleteFile(categoryName, fileId));
  });
  return responses;
};
