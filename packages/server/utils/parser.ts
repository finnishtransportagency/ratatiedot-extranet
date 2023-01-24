import { ALBEvent } from 'aws-lambda';
import busboy, { FileInfo } from 'busboy';
import { Readable } from 'stream';

export interface ParsedFormDataOptions {
  [key: string]: string | Buffer | Readable | FileInfo;
}

export const parseForm = (event: ALBEvent) => {
  return new Promise<ParsedFormDataOptions>((resolve, reject) => {
    if (event.headers) {
      const form = {} as ParsedFormDataOptions;
      const bb = busboy({ headers: event.headers });

      // bb.on('field', (fieldname, val) => {
      //   form[fieldname] = val;
      // });

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

      bb.end(event.body);
    }
  });
};
