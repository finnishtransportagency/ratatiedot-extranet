import { ALBEventHeaders } from 'aws-lambda';
import busboy, { FileInfo } from 'busboy';
import { Readable } from 'stream';
import { log } from './logger';

export interface ParsedFormDataOptions {
  [key: string]: string | Buffer | Readable | FileInfo;
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
      const chunks: Buffer[] = [];
      file.on('data', (data: Buffer) => {
        log.debug(`Received ${data.length} bytes for field ${fieldname}`);
        chunks.push(data);
      });

      file.on('end', () => {
        log.debug(`Finished receiving file for field ${fieldname}, total size: ${chunks.length} bytes`);
        form = {
          ...form,
          fieldname,
          filedata: Buffer.concat(chunks),
          fileinfo,
        };
        log.info('File parse finished');
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
