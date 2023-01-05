import { AlfrescoFileRequestBuilder } from './alfrescoRequestBuilder';
import { FileDeleteRequest, FileDeleteRequestBody, FileRequest, IFileRequestBody } from './types';

export const fileRequestBuilder = (request: IFileRequestBody): FileRequest => {
  const alfrescoRequestBuilder = new AlfrescoFileRequestBuilder();
  return alfrescoRequestBuilder.requestBuilder(request);
};
export const deleteFileRequestBuilder = (request: FileDeleteRequestBody): FileDeleteRequest => {
  const alfrescoRequestBuilder = new AlfrescoFileRequestBuilder();
  return alfrescoRequestBuilder.deleteRequestBuilder(request);
};
// TODO: Delete request builder
