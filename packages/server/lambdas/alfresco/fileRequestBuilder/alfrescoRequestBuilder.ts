import axios, { AxiosError, AxiosResponse } from 'axios';
import { getAlfrescoUrlBase } from '../../../utils/alfresco';
import { FileDeleteRequest, FileDeleteRequestBody, IFileRequestBody, IFileResponse } from './types';
import { FormData } from 'formdata-node';
import fetch from 'node-fetch';

const dataToBlob = async (data: string) => {
  const base64 = await fetch(data);
  const blob = base64.blob();
  return blob;
};
const postFile = async (data: FormData, nodeId: string) => {
  await axios({
    method: 'post',
    url: `${getAlfrescoUrlBase()}/nodes/${nodeId}/children`,
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export class AlfrescoFileRequestBuilder {
  public async requestBuilder(
    nodeId: string,
    requestBody: string,
  ): Promise<AxiosResponse<IFileResponse> | AxiosError | void> {
    dataToBlob(requestBody)
      .then((blob) => {
        const bodyFormData = new FormData();

        bodyFormData.append('filedata', blob, Date.now().toString() + '_FILE.txt');

        postFile(bodyFormData, nodeId)
          .then((response) => {
            console.log('RESPONSE1: ', response);
            return response;
          })
          .catch((error: AxiosError) => {
            console.log(error);
            return error;
          });
      })
      .catch((error) => {
        return error;
      });
  }
  public deleteRequestBuilder(requestParameters: FileDeleteRequestBody): FileDeleteRequest {
    throw new Error('Method not implemented.');
  }
}
