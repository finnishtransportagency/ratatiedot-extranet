import axios, { AxiosError, AxiosResponse } from 'axios';
import { getAlfrescoUrlBase } from '../../../utils/alfresco';
import { FileDeleteRequest, FileDeleteRequestBody, IFileResponse } from './types';
import { FormData } from 'formdata-node';
import { log } from '../../../utils/logger';

const postFile = async (data: FormData, nodeId: string) => {
  return await axios({
    method: 'post',
    url: `${getAlfrescoUrlBase()}/nodes/${nodeId}/children`,
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export class AlfrescoFileRequestBuilder {
  public async requestBuilder(
    nodeId: string,
    requestBody: FormData,
  ): Promise<AxiosResponse<IFileResponse> | AxiosError> {
    log.info('requestBuilder 23');

    const response = postFile(requestBody, nodeId)
      .then((response) => {
        console.log('RESPONSE1: ', response);
        return response;
      })
      .catch((error: AxiosError) => {
        console.log('ERROR1', error);
        return error;
      });

    return response;
  }
  public deleteRequestBuilder(requestParameters: FileDeleteRequestBody): FileDeleteRequest {
    throw new Error('Method not implemented.');
  }
}
