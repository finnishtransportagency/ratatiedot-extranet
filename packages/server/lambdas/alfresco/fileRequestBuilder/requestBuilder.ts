import { FileDeleteRequest, FileDeleteRequestBody, FileRequest, IFileRequestBody } from './types';

export interface RequestBuilder {
  // TODO: Split for upload/update if necessary
  requestBuilder(requestParameters: IFileRequestBody): FileRequest;
  deleteRequestBuilder(requestParameters: FileDeleteRequestBody): FileDeleteRequest;
}
