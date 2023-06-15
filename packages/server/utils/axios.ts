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
      const listFilesEndpoint = /\/api\/nodes\/[A-Za-z0-9-]+\/where=\(isFolder=true\)&include=path/;
      console.log('url and regex match: ', error.config?.url && listFilesEndpoint.test(error.config?.url));
      if (error.config?.url && listFilesEndpoint.test(error.config?.url)) {
        console.log('list-files endpoint, check for 404');
        // In case nodeId doesn't exist, Alfresco throws 404
        if (error.response?.status === 404) {
          console.log('404, return null');
          return null;
        }
      }
      const simplifiedError = {
        status: error.response?.status,
        message: error.message,
        stack: error.stack,
      };
      console.log('throw simplifiedError');
      throw simplifiedError;
    }
    throw error;
  },
);
