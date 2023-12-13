import axios, { AxiosResponse } from 'axios';

export const getNotices = async (page?: number): Promise<AxiosResponse> => {
  const response = await axios.get('/api/notices', { params: { page } });

  return response as any;
};
