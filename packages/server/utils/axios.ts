import axios from 'axios';
import { getAlfrescoUrlBase } from './alfresco';

export const alfrescoAxios = axios.create({
  baseURL: getAlfrescoUrlBase(),
});

alfrescoAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const simplifiedError = {
        status: error.response?.status,
        message: error.message,
      };
      if (error.response?.status === 404) {
        return null;
      }
      throw simplifiedError;
    }
    throw error;
  },
);
