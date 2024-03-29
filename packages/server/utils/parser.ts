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
      limits: {
        files: 1,
        // fileSize: 1000000, // bytes = 1MB
      },
    });
    let form = {} as ParsedFormDataOptions;

    bb.on('file', (fieldname: string, file: Readable, fileinfo: FileInfo) => {
      const chunks: Buffer[] = [];
      // convert the filename to utf-8 since latin1 preserves individual bytes
      fileinfo.filename = Buffer.from(fileinfo.filename, 'latin1').toString('utf8');

      file.on('data', (data: Buffer) => {
        log.debug(`Received ${data.length} bytes for field ${fieldname}`);
        chunks.push(data);
      });

      file.on('end', () => {
        log.debug(
          `Finished receiving file for field ${fieldname}, total size: ${chunks.reduce(
            (acc, chunk) => acc + chunk.length,
            0,
          )} bytes`,
        );

        form = {
          ...form,
          fieldname,
          filedata: Buffer.concat(chunks),
          fileinfo,
        };
        chunks.length = 0; // Clearing the chunks array
        log.info('File parse finished');
      });

      file.on('error', (err) => {
        reject(err);
      });

      file.on('close', () => {
        log.debug(`File stream for field ${fieldname} closed.`);
      });
    });

    bb.on('field', (fieldname, value) => {
      if (fieldname === 'cm:description') {
        form['cm:description'] = value;
      }
      if (fieldname === 'cm:title') {
        form['cm:title'] = value;
      }
      if (fieldname === 'notice') {
        form['notice'] = value;
      }
      if (fieldname === 'pagecontent') {
        form['pagecontent'] = value;
      }
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
