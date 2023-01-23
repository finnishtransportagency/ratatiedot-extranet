import axios, { AxiosError, AxiosResponse } from 'axios';
import { getAlfrescoUrlBase } from '../../../utils/alfresco';
import { FileDeleteRequest, FileDeleteRequestBody, IFileRequestBody, IFileResponse } from './types';
import { FormData } from 'formdata-node';

const dataToBlob = async (data: string) => {
  const base64 = await fetch(data);
  const blob = await base64.blob();
  return blob;
};
export class AlfrescoFileRequestBuilder {
  public async requestBuilder(nodeId: string, requestBody: string): Promise<AxiosResponse<IFileResponse> | AxiosError> {
    const bodyFormData = new FormData();

    const blob = dataToBlob(requestBody);
    console.log('blob: ', blob);
    bodyFormData.append('filedata', blob, Date.now().toString() + '_FILE.txt');
    console.log('bodyFormData -> ', bodyFormData);

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
