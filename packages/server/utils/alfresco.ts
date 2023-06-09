import { CategoryDataBase } from '@prisma/client';
import { getSecuredStringParameter } from './parameterStore';
import { AlfrescoResponse } from '../lambdas/alfresco/fileRequestBuilder/types';
import fetch, { RequestInit } from 'node-fetch';

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

export const alfrescoFetch = async (url: string, options: RequestInit) => {
  const res = await fetch(url, options);
  if (res.ok) {
    const text = await res.text();
    if (!text) return;
    const result = JSON.parse(text);
    return result as AlfrescoResponse;
  } else {
    console.error('HTTP error:', res.status, res.statusText);
    throw new Error(`HTTP error: ${res.status} ${res.statusText}`);
  }
};
