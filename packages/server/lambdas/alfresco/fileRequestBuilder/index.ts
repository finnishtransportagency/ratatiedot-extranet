import { AlfrescoFileRequestBuilder } from './alfrescoRequestBuilder';
import { FileDeleteRequest, FileDeleteRequestBody, FileStore } from './types';
import { ALBEvent } from 'aws-lambda';

export const fileRequestBuilder = (event: ALBEvent, headers: HeadersInit, store?: FileStore) => {
  switch (store) {
    case FileStore.ALFRESCO:
    default:
      const alfrescoRequestBuilder = new AlfrescoFileRequestBuilder();
      return alfrescoRequestBuilder.requestBuilder(event, headers);
  }
};
export const updateFileRequestBuilder = (event: ALBEvent, headers: HeadersInit, store?: FileStore) => {
  switch (store) {
    case FileStore.ALFRESCO:
    default:
      const alfrescoRequestBuilder = new AlfrescoFileRequestBuilder();
      return alfrescoRequestBuilder.updateRequestBuilder(event, headers);
  }
};
export const updateFileMetadataRequestBuilder = (event: ALBEvent, headers: HeadersInit, store?: FileStore) => {
  switch (store) {
    case FileStore.ALFRESCO:
    default:
      const alfrescoRequestBuilder = new AlfrescoFileRequestBuilder();
      return alfrescoRequestBuilder.updateJsonRequestBuilder(event, headers);
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
