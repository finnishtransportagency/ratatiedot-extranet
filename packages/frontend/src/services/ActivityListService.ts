import axios, { AxiosResponse } from 'axios';

export const getActivities = async (page?: number): Promise<AxiosResponse> => {
  const response = await axios.get('/api/database/activities');

  return response as any;
};
