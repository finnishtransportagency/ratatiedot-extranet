import { ALBEventHeaders } from 'aws-lambda';
import busboy, { FileInfo } from 'busboy';
import { Readable } from 'stream';

export interface ParsedFormDataOptions {
  [key: string]: string | Buffer | Readable | FileInfo;
}

interface FormData {
  fieldname: string;
  fileinfo?: FileInfo;
  filedata: any;
}

export const parseForm = (buffer: Buffer | string, headers: ALBEventHeaders) => {
  return new Promise<ParsedFormDataOptions>((resolve, reject) => {
    const bb = busboy({
      headers: {
        ...headers,
        'content-type': headers['Content-Type'] || headers['content-type'],
      },
    });
    let form = {} as ParsedFormDataOptions;

    bb.on('file', (fieldname: string, file: Readable, fileinfo: FileInfo) => {
      const temp: FormData = { filedata: [], fieldname: '' };
      file.on('data', (data: Buffer) => {
        temp.filedata.push(data);
      });

      file.on('end', () => {
        temp.filedata = Buffer.concat(temp.filedata);
        temp.fieldname = fieldname;
        temp.fileinfo = fileinfo as FileInfo;

        form = { ...temp };
        console.log('File parse finished');
      });
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
