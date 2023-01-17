import { AlfrescoFileRequestBuilder } from './alfrescoRequestBuilder';
import { FileDeleteRequest, FileDeleteRequestBody, IFileRequestBody, FileStore } from './types';

export const fileRequestBuilder = (nodeId: string, request: string, store?: FileStore) => {
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
