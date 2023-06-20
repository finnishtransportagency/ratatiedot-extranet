import FormData from 'form-data';
import { ParsedFormDataOptions, parseForm } from '../../../utils/parser';
import { ALBEvent, ALBEventHeaders } from 'aws-lambda';
import { FileInfo } from 'busboy';
import { log } from '../../../utils/logger';

// Keeping these functions here until file upload is confirmed to work in production
// const base64ToString = (base64string: string): string => {
//   const buffer = Buffer.from(base64string, 'base64').toString('utf-8').replace(/\r?\n/g, '\r\n');
//   return buffer;
// };
// const bufferToBlob = (buffer: Buffer) => {
//   const blob = new Blob([buffer]);
//   return blob;
// };

const base64ToBuffer = (base64string: string): Buffer => {
  const buffer = Buffer.from(base64string, 'base64');
  return buffer;
};

const createForm = (requestFormData: ParsedFormDataOptions): FormData => {
  const formData = new FormData();
  const fileData: Buffer = requestFormData.filedata as Buffer;
  const fileInfo = requestFormData.fileinfo as FileInfo;
  log.debug(`File data buffer size: ${fileData.length}`);
  formData.append('filedata', fileData, { filename: fileInfo.filename });
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
    const form = createForm(formData);
    const options = {
      method: 'POST',
      body: form,
      headers: {
        ...headers,
        ...form.getHeaders(),
      },
    };
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
