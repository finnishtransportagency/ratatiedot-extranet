import { getAlfrescoUrlBase } from '../../../utils/alfresco';
import { FileDeleteRequest, FileDeleteRequestBody } from './types';
import fetch from 'node-fetch';
import { log } from '../../../utils/logger';

const postFile = async (data: FormData, nodeId: string) => {
  log.info('postFile(), data : ');
  log.info(data);
  log.info(nodeId);
  const url = `${getAlfrescoUrlBase()}/nodes/${nodeId}/children`;
  const resp = await fetch(url, {
    method: 'POST',
    body: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  console.log(resp);
  return resp;
};

export class AlfrescoFileRequestBuilder {
  public async requestBuilder(nodeId: string, requestBody: FormData) {
    log.info('requestBuilder, requestBody : ');
    log.info(requestBody);

    try {
      await postFile(requestBody, nodeId);
    } catch (error) {
      console.log('request was aborted');
    }
  }
  public deleteRequestBuilder(requestParameters: FileDeleteRequestBody): FileDeleteRequest {
    throw new Error('Method not implemented.');
  }
}
