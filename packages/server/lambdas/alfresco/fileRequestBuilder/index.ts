import { AlfrescoFileRequestBuilder } from './alfrescoRequestBuilder';
import { FileDeleteRequest, FileDeleteRequestBody, FileStore } from './types';
import { FormData } from 'formdata-node';

export const fileRequestBuilder = (nodeId: string, request: FormData, store?: FileStore) => {
  switch (store) {
    case FileStore.ALFRESCO:
    default:
      const alfrescoRequestBuilder = new AlfrescoFileRequestBuilder();
      return alfrescoRequestBuilder.requestBuilder(nodeId, request);
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
// TODO: Delete request builder
