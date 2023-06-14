import axios from 'axios';
import { getAlfrescoUrlBase } from './alfresco';

export const alfrescoApiVersion = '/alfresco/versions/1';

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
        stack: error.stack,
      };
      throw simplifiedError;
    }
    throw error;
  },
);
