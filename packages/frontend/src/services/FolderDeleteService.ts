import axios, { AxiosResponse } from 'axios';

export const deleteFolder = async (categoryName: string, folderId: string) => {
  return (await axios(`/api/alfresco/folder/${categoryName}/${folderId}`, {
    method: 'DELETE',
  })) as AxiosResponse;
};
