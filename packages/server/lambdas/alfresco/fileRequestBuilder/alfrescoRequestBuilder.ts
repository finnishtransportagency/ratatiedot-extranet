import { RequestBuilder } from './requestBuilder';
import { FileDeleteRequest, FileDeleteRequestBody, FileRequest, IFileRequestBody } from './types';

export class AlfrescoFileRequestBuilder implements RequestBuilder {
  // TODO: Transform generic request to alfresco request
  public requestBuilder(requestparameters: IFileRequestBody): FileRequest {
    throw new Error('Method not implemented.');
  }
  public deleteRequestBuilder(requestParameters: FileDeleteRequestBody): FileDeleteRequest {
    throw new Error('Method not implemented.');
  }
}
