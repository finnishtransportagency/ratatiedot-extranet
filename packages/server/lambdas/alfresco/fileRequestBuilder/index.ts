import { AlfrescoFileRequestBuilder } from './alfrescoRequestBuilder';
import { FileDeleteRequest, FileDeleteRequestBody, FileStore } from './types';
import { ALBEvent } from 'aws-lambda';

export const fileRequestBuilder = (event: ALBEvent, store?: FileStore) => {
  switch (store) {
    case FileStore.ALFRESCO:
    default:
      const alfrescoRequestBuilder = new AlfrescoFileRequestBuilder();
      return alfrescoRequestBuilder.requestBuilder(event);
  }
};
export const deleteFileRequestBuilder = (request: FileDeleteRequestBody, store?: FileStore): FileDeleteRequest => {
  switch (store) {
    case FileStore.ALFRESCO:
    default:
      const alfrescoRequestBuilder = new AlfrescoFileRequestBuilder();
      return alfrescoRequestBuilder.deleteRequestBuilder(request);
  }
};
