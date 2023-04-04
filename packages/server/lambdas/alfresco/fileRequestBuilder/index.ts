import { AlfrescoFileRequestBuilder, AlfrescoFolderRequestBuilder } from './alfrescoRequestBuilder';
import { FileStore } from './types';
import { ALBEvent } from 'aws-lambda';

export const fileRequestBuilder = (event: ALBEvent, headers: HeadersInit, store = FileStore.ALFRESCO) => {
  switch (store) {
    case FileStore.ALFRESCO:
      const alfrescoRequestBuilder = new AlfrescoFileRequestBuilder();
      return alfrescoRequestBuilder.requestBuilder(event, headers);
    default:
      break;
  }
};
export const updateFileRequestBuilder = (event: ALBEvent, headers: HeadersInit, store = FileStore.ALFRESCO) => {
  switch (store) {
    case FileStore.ALFRESCO:
      const alfrescoRequestBuilder = new AlfrescoFileRequestBuilder();
      return alfrescoRequestBuilder.updateRequestBuilder(event, headers);
    default:
      break;
  }
};
export const updateFileMetadataRequestBuilder = (event: ALBEvent, headers: HeadersInit, store = FileStore.ALFRESCO) => {
  switch (store) {
    case FileStore.ALFRESCO:
      const alfrescoRequestBuilder = new AlfrescoFileRequestBuilder();
      return alfrescoRequestBuilder.updateJsonRequestBuilder(event, headers);
    default:
      break;
  }
};
export const deleteFileRequestBuilder = (headers: HeadersInit, store = FileStore.ALFRESCO) => {
  switch (store) {
    case FileStore.ALFRESCO:
      const alfrescoRequestBuilder = new AlfrescoFileRequestBuilder();
      return alfrescoRequestBuilder.deleteRequestBuilder(headers);
    default:
      break;
  }
};

export const folderCreateRequestBuilder = (event: ALBEvent, headers: HeadersInit, store = FileStore.ALFRESCO) => {
  switch (store) {
    case FileStore.ALFRESCO:
      const alfrescoRequestBuilder = new AlfrescoFolderRequestBuilder();
      return alfrescoRequestBuilder.create(event, headers);
    default:
      break;
  }
};
export const folderUpdateRequestBuilder = (event: ALBEvent, headers: HeadersInit, store = FileStore.ALFRESCO) => {
  switch (store) {
    case FileStore.ALFRESCO:
      const alfrescoRequestBuilder = new AlfrescoFolderRequestBuilder();
      return alfrescoRequestBuilder.update(event, headers);
    default:
      break;
  }
};
export const folderDeleteRequestBuilder = (headers: HeadersInit, store = FileStore.ALFRESCO) => {
  switch (store) {
    case FileStore.ALFRESCO:
      const alfrescoRequestBuilder = new AlfrescoFolderRequestBuilder();
      return alfrescoRequestBuilder.delete(headers);
    default:
      break;
  }
};
