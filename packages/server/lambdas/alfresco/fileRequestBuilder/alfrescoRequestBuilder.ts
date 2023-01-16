import axios, { AxiosError, AxiosResponse } from 'axios';
import { getAlfrescoUrlBase } from '../../../utils/alfresco';
import { FileDeleteRequest, FileDeleteRequestBody, IFileRequestBody, IFileResponse } from './types';

export class AlfrescoFileRequestBuilder {
  public async requestBuilder(
    nodeId: string,
    requestBody: IFileRequestBody,
  ): Promise<AxiosResponse<IFileResponse> | AxiosError> {
    const bodyFormData = new FormData();
    for (const key in requestBody) {
      if (Object.prototype.hasOwnProperty.call(requestBody, key)) {
        bodyFormData.append(key, requestBody[key as keyof IFileRequestBody]);
      }
    }

    const response = await axios({
      method: 'post',
      url: `${getAlfrescoUrlBase()}/nodes/${nodeId}/children`,
      data: bodyFormData,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      .then((response) => {
        console.log(response);
        return response;
      })
      .catch((error: AxiosError) => {
        console.log(error);
        return error;
      });
    return response;
  }
  public deleteRequestBuilder(requestParameters: FileDeleteRequestBody): FileDeleteRequest {
    throw new Error('Method not implemented.');
  }
}
