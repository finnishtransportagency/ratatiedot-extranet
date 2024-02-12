import { AlfrescoFileRequestBuilder } from './alfrescoRequestBuilder';
import { AlfrescoFolderRequestBuilder } from './alfrescoRequestBuilder';
import { FileStore } from './types';
import { ALBEvent, ALBEventHeaders } from 'aws-lambda';

export const fileRequestBuilder = (event: ALBEvent, headers: ALBEventHeaders, store = FileStore.ALFRESCO) => {
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

export const folderCreateRequestBuilder = (event: ALBEvent, headers: HeadersInit) => {
  const builder = new AlfrescoFolderRequestBuilder();
  return builder.post(event, headers);
};
export const folderUpdateRequestBuilder = (event: ALBEvent, headers: HeadersInit) => {
  const builder = new AlfrescoFolderRequestBuilder();
  return builder.put(event, headers);
};
export const folderDeleteRequestBuilder = (headers: HeadersInit) => {
  return new AlfrescoFolderRequestBuilder().delete(headers);
};
