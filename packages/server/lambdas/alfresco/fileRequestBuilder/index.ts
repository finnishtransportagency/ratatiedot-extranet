import { AlfrescoFileRequestBuilder } from './alfrescoRequestBuilder';
import { FileDeleteRequest, FileDeleteRequestBody, FileRequest, IFileRequestBody, FileStore } from './types';

export const fileRequestBuilder = (request: IFileRequestBody, store?: FileStore): FileRequest => {
  switch (store) {
    case FileStore.ALFRESCO:
    default:
      const alfrescoRequestBuilder = new AlfrescoFileRequestBuilder();
      return alfrescoRequestBuilder.requestBuilder(request);
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
