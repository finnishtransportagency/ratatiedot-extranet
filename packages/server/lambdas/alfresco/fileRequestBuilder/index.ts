import { AlfrescoFileRequestBuilder } from './alfrescoRequestBuilder';
import { FileDeleteRequest, FileDeleteRequestBody, FileStore } from './types';
import { ALBEvent } from 'aws-lambda';

export const fileRequestBuilder = (event: ALBEvent, headers: HeadersInit, store?: FileStore) => {
  switch (store) {
    case FileStore.ALFRESCO:
      const alfrescoRequestBuilder = new AlfrescoFileRequestBuilder();
      return alfrescoRequestBuilder.requestBuilder(event, headers);
    default:
      break;
  }
};
export const updateFileRequestBuilder = (event: ALBEvent, headers: HeadersInit, store?: FileStore) => {
  switch (store) {
    case FileStore.ALFRESCO:
      const alfrescoRequestBuilder = new AlfrescoFileRequestBuilder();
      return alfrescoRequestBuilder.updateRequestBuilder(event, headers);
    default:
      break;
  }
};
export const updateFileMetadataRequestBuilder = (event: ALBEvent, headers: HeadersInit, store?: FileStore) => {
  switch (store) {
    case FileStore.ALFRESCO:
      const alfrescoRequestBuilder = new AlfrescoFileRequestBuilder();
      return alfrescoRequestBuilder.updateJsonRequestBuilder(event, headers);
    default:
      break;
  }
};
export const deleteFileRequestBuilder = (
  request: FileDeleteRequestBody,
  store?: FileStore,
): FileDeleteRequest | undefined => {
  switch (store) {
    case FileStore.ALFRESCO:
      const alfrescoRequestBuilder = new AlfrescoFileRequestBuilder();
      return alfrescoRequestBuilder.deleteRequestBuilder(request);
    default:
      break;
  }
};
