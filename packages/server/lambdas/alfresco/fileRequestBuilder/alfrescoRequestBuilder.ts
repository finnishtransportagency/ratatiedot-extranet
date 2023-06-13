import { FormData } from 'formdata-node';
import { ParsedFormDataOptions, parseForm } from '../../../utils/parser';
import { ALBEvent, ALBEventHeaders } from 'aws-lambda';
import { Blob } from 'buffer';
import { FileInfo } from 'busboy';
import { log } from '../../../utils/logger';

// Keeping this function here until file upload is confirmed to work in production
// const base64ToString = (base64string: string): string => {
//   const buffer = Buffer.from(base64string, 'base64').toString('utf-8').replace(/\r?\n/g, '\r\n');
//   return buffer;
// };

const base64ToBuffer = (base64string: string): Buffer => {
  const buffer = Buffer.from(base64string, 'base64');
  return buffer;
};

const bufferToBlob = (buffer: Buffer) => {
  const unit8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const blob = new Blob([unit8Array]);
  return blob;
};

const createForm = async (requestFormData: ParsedFormDataOptions): Promise<FormData> => {
  const formData = new FormData();
  const fileData: Blob = await bufferToBlob(requestFormData.filedata as Buffer);
  const fileInfo = (await requestFormData.fileinfo) as FileInfo;
  log.debug(`File data blob size: ${fileData.size}`);
  formData.append('filedata', fileData, fileInfo.filename);
  formData.append('name', fileInfo.filename);
  formData.append('nodeType', 'cm:content');
  return formData;
};

export class AlfrescoFileRequestBuilder {
  public async requestBuilder(event: ALBEvent, headers: ALBEventHeaders) {
    const body = event.body ?? '';
    let buffer;
    if (event.isBase64Encoded) {
      buffer = base64ToBuffer(event.body as string);
    }
    const formData = await parseForm(buffer ?? body, event.headers as ALBEventHeaders);
    const form = await createForm(formData);
    const options = {
      method: 'POST',
      body: form,
      headers: headers,
    } as RequestInit;
    console.log('requestBuilder options: ', options);
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

export class AlfrescoFolderRequestBuilder {
  public async post(event: ALBEvent, headers: HeadersInit) {
    const options = {
      method: 'POST',
      body: event.body,
      headers: headers,
    } as RequestInit;
    return options;
  }
  public async put(event: ALBEvent, headers: HeadersInit) {
    const options = {
      method: 'PUT',
      body: event.body,
      headers: headers,
    } as RequestInit;
    return options;
  }
  public async delete(headers: HeadersInit) {
    const options = {
      method: 'DELETE',
      headers: headers,
    } as RequestInit;
    return options;
  }
}
