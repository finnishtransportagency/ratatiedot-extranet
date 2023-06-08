import { ALBEventHeaders } from 'aws-lambda';
import busboy, { FileInfo } from 'busboy';
import { Readable } from 'stream';
import { log } from './logger';

export interface ParsedFormDataOptions {
  [key: string]: string | Buffer | Readable | FileInfo;
}

// interface FormData {
//   fieldname: string;
//   fileinfo?: FileInfo;
//   file: any;
// }

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
      const { filename, encoding, mimeType } = fileinfo;
      log.info('filename: ', filename);
      log.info('encoding: ', encoding);
      log.info('mimeType: ', mimeType);
      const chunks: Buffer[] = [];
      file.on('data', (data: Buffer) => {
        log.info(`Received ${data.length} bytes for field ${fieldname}`);
        chunks.push(data);
      });

      file.on('end', () => {
        const fileInfo: FileInfo = { filename, encoding, mimeType };
        console.log(`Finished receiving file for field ${fieldname}, total size: ${chunks.length} bytes`);
        form = {
          ...form,
          fieldname,
          file: Buffer.concat(chunks),
          fileinfo: fileInfo,
        };
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
