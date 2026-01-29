import type { CategoryDataBase } from '../generated/prisma/client';
import { getSecuredStringParameter } from './parameterStore';

const alfrescoAPIKeyName = process.env.ALFRESCO_API_KEY_NAME || '';
const alfrescoAPIUrl = process.env.ALFRESCO_API_URL || '';
const alfrescoAncestor = process.env.ALFRESCO_API_ANCESTOR || '';

let alfrescoAPIKey = '';

export const getAlfrescoOptions = async (uid: string, headers?: Record<string, string>) => {
  if (!alfrescoAPIKey) {
    alfrescoAPIKey = await getSecuredStringParameter(alfrescoAPIKeyName);
  }
  return {
    headers: {
      ...headers,
      'X-API-Key': alfrescoAPIKey,
      'OAM-REMOTE-USER': uid,
    },
  };
};

export const getAlfrescoUrlBase = () => alfrescoAPIUrl;

export const getAlfrescoAncestor = () => alfrescoAncestor;

export const findEndpoint = (
  queryEndpoint: string,
  fileEndpoints: Array<CategoryDataBase>,
): CategoryDataBase | undefined => fileEndpoints.find((endpoint) => endpoint.rataextraRequestPage === queryEndpoint);
