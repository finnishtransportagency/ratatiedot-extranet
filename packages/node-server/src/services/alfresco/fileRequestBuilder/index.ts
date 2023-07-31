import { AlfrescoFileRequestBuilder } from './alfrescoRequestBuilder.js';
import { FileStore } from './types.js';
import { Request } from 'express';

export const fileRequestBuilder = (
  req: Request,
  headers: Record<string, string | undefined>,
  store = FileStore.ALFRESCO,
) => {
  switch (store) {
    case FileStore.ALFRESCO:
      const alfrescoRequestBuilder = new AlfrescoFileRequestBuilder();
      return alfrescoRequestBuilder.requestBuilder(req, headers);
    default:
      break;
  }
};
