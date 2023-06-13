import axios from 'axios';
import { getAlfrescoUrlBase } from './alfresco';

export const alfrescoAxios = axios.create({
  baseURL: getAlfrescoUrlBase(),
});

alfrescoAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const errorCopy = { ...error };
      delete errorCopy.config?.headers?.['X-API-Key'];
      delete errorCopy.request?._redirectable?._options?.headers['X-API-Key'];
      throw errorCopy;
    }
    throw error;
  },
);
