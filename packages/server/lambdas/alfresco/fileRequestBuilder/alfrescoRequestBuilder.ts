import { FormData } from 'formdata-node';
import { ParsedFormDataOptions, parseForm } from '../../../utils/parser';
import { ALBEvent } from 'aws-lambda';
import { Blob } from 'buffer';
import { FileInfo } from 'busboy';

const base64ToString = (base64string: string): string => {
  const buffer = Buffer.from(base64string, 'base64').toString('utf-8').replace(/\r?\n/g, '\r\n');
  return buffer;
};

const base64ToBuffer = (base64string: string): Buffer => {
  const buffer = Buffer.from(base64string, 'base64');
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
    if (event.isBase64Encoded) {
      event.body = base64ToString(event.body as string);
    }
    const options = {
      method: 'POST',
      body: createForm(await parseForm(event)),
      headers: headers,
    } as RequestInit;
    return options;
  }
  public async updateRequestBuilder(event: ALBEvent, headers: HeadersInit) {
    const buffer = base64ToBuffer(event.body as string);
    const options = {
      method: 'PUT',
      body: buffer,
      headers: headers,
    } as RequestInit;
    return options;
  }
  public updateJsonRequestBuilder(event: ALBEvent, headers: HeadersInit) {
    const options = {
      method: 'PUT',
      body: event.body,
      headers: headers,
    } as RequestInit;
    return options;
  }
  public deleteRequestBuilder(headers: HeadersInit) {
    const options = {
      method: 'DELETE',
      headers: headers,
    };
    return options;
  }
}
