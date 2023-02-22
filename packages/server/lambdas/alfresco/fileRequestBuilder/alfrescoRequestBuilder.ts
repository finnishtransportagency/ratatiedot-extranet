import { FileDeleteRequest, FileDeleteRequestBody } from './types';
import { FormData } from 'formdata-node';
import { ParsedFormDataOptions, parseForm } from '../../../utils/parser';
import { ALBEvent } from 'aws-lambda';
import { Blob } from 'buffer';
import { FileInfo } from 'busboy';

const base64ToBuffer = (base64string: string) => {
  const buffer = Buffer.from(base64string, 'base64').toString('utf-8').replace(/\r?\n/g, '\r\n');
  return buffer;
};

const bufferToBlob = (buffer: Buffer) => {
  const blob = new Blob([buffer]);
  return blob;
};

const createForm = (requestFormData: ParsedFormDataOptions): FormData => {
  const formData = new FormData();
  const fileData: Blob = bufferToBlob(requestFormData.filedata as Buffer);
  const fileInfo = requestFormData.fileinfo as FileInfo;
  formData.append('filedata', fileData, fileInfo.filename);
  formData.append('name', fileInfo.filename);
  formData.append('nodeType', 'cm:content');
  return formData;
};

export class AlfrescoFileRequestBuilder {
  public async requestBuilder(event: ALBEvent, headers: HeadersInit) {
    event.body = base64ToBuffer(event.body as string);
    const parsedForm = (await parseForm(event)) as ParsedFormDataOptions;
    const options = {
      method: 'POST',
      body: createForm(parsedForm),
      headers: headers,
    } as unknown as RequestInit;
    return options;
  }
  public async updateRequestBuilder(event: ALBEvent, headers: HeadersInit) {
    event.body = base64ToBuffer(event.body as string);
    const fileData = (await parseForm(event)) as ParsedFormDataOptions;
    const options = {
      method: 'PUT',
      body: fileData.file,
      headers: headers,
    } as unknown as RequestInit;
    return options;
  }
  public deleteRequestBuilder(requestParameters: FileDeleteRequestBody): FileDeleteRequest {
    throw new Error('Method not implemented.');
  }
}
