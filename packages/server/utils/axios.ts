import axios from 'axios';
import { getAlfrescoUrlBase } from './alfresco';

export const alfrescoApiVersion = '/alfresco/versions/1';
export const alfrescoSearchApiVersion = '/search/versions/1/search';

export const alfrescoAxios = axios.create({
  baseURL: getAlfrescoUrlBase(),
});

alfrescoAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const listFilesEndpoint = /\/alfresco\/versions\/1\/nodes\/[A-Za-z0-9-]+\?where=\(isFolder=true\)&include=path/;
      if (error.config?.url && listFilesEndpoint.test(error.config?.url)) {
        // In case nodeId doesn't exist, Alfresco throws 404
        if (error.response?.status === 404) {
          return Promise.resolve(error.response);
        }
      }
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
