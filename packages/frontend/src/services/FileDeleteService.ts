import axios, { AxiosResponse } from 'axios';

export const deleteFile = async (categoryName: string, fileId: string) => {
  return (await axios(`http://localhost:3002/api/alfresco/file/${categoryName}/${fileId}`, {
    method: 'DELETE',
  })) as AxiosResponse;
};
