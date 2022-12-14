import { CategoryDataBase } from '@prisma/client';
import { getParameter, getSecuredStringParameter } from './parameterStore';

const alfrescoAPIKeyName = process.env.ALFRESCO_API_KEY || '';
const alfrescoAPIUrlName = process.env.ALFRESCO_API_URL || '';
const alfrescoAncestorParameterName = process.env.ALFRESCO_API_ANCESTOR || '';

let alfrescoAPIKey: string | null = null;
let alfrescoAPIUrl: string | null = null;
let alfrescoAncestor: string | null = null;

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

export const getAlfrescoUrlBase = async () => {
  if (!alfrescoAPIUrl) {
    alfrescoAPIUrl = await getParameter(alfrescoAPIUrlName);
  }
  return alfrescoAPIUrl;
};

export const getAlfrescoAncestor = async () => {
  if (!alfrescoAncestor) {
    alfrescoAncestor = await getParameter(alfrescoAncestorParameterName);
  }
  return alfrescoAncestor;
};

export const findEndpoint = (
  queryEndpoint: string,
  fileEndpoints: Array<CategoryDataBase>,
): CategoryDataBase | undefined => fileEndpoints.find((endpoint) => endpoint.rataextraRequestPage === queryEndpoint);
