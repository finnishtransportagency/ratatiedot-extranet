import { ALBEventHeaders } from 'aws-lambda';
import busboy, { FileInfo } from 'busboy';
import { Readable } from 'stream';

export interface ParsedFormDataOptions {
  [key: string]: string | Buffer | Readable | FileInfo;
}

export const parseForm = (buffer: Buffer | string, headers: ALBEventHeaders) => {
  return new Promise<ParsedFormDataOptions>((resolve, reject) => {
    const form = {} as ParsedFormDataOptions;
    const bb = busboy({ headers: headers });

    bb.on('file', (fieldname: string, file: Readable, fileinfo: FileInfo) => {
      form.fieldname = fieldname;
      form.file = file;
      form.fileinfo = fileinfo as FileInfo;

      file.on('data', (data: Buffer) => {
        form[fieldname] = data;
      });

      file.on('end', () => console.log('File parse finished'));
    });

    bb.on('finish', () => {
      resolve(form);
    });

    bb.on('error', (err) => {
      reject(err);
    });

    bb.end(buffer);
  });
};
