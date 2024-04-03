import axios, { AxiosResponse } from 'axios';

export const getFolders = async (categoryName: string): Promise<AxiosResponse> => {
  const response = await axios.get(`/api/alfresco/folders?category=${categoryName}`);

  return response as any;
};
