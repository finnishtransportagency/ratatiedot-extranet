import { ALBEventHeaders } from 'aws-lambda';
import busboy, { FileInfo } from 'busboy';
import { Readable } from 'stream';
import { log } from './logger';

export interface FileUpload {
  filename: string;
  buffer: Buffer;
}

export interface ParsedFormDataOptions {
  [key: string]: string | Buffer | Readable | FileInfo | FileUpload[];
}

export const parseForm = (buffer: Buffer | string, headers: ALBEventHeaders) => {
  return new Promise<ParsedFormDataOptions>((resolve, reject) => {
    const bb = busboy({
      headers: {
        ...headers,
        'content-type': headers['Content-Type'] || headers['content-type'],
      },
      limits: {
        files: 10, // Allow multiple files
        // fileSize: 1000000, // bytes = 1MB
      },
    });
    let form = {} as ParsedFormDataOptions;
    const files: FileUpload[] = [];
    let fileCount = 0;

    bb.on('file', (fieldname: string, file: Readable, fileinfo: FileInfo) => {
      const chunks: Buffer[] = [];
      // convert the filename to utf-8 since latin1 preserves individual bytes
      fileinfo.filename = Buffer.from(fileinfo.filename, 'latin1').toString('utf8');
      fileCount++;

      file.on('data', (data: Buffer) => {
        log.debug(`Received ${data.length} bytes for field ${fieldname}`);
        chunks.push(data);
      });

      file.on('end', () => {
        const fileBuffer = Buffer.concat(chunks as unknown as Uint8Array[]);
        log.debug(
          `Finished receiving file for field ${fieldname}, filename: ${fileinfo.filename}, size: ${fileBuffer.length} bytes`,
        );

        // Add to files array
        files.push({
          filename: fileinfo.filename,
          buffer: fileBuffer,
        });

        // For backwards compatibility, also set the old format for the first file
        if (fileCount === 1) {
          form = {
            ...form,
            fieldname,
            filedata: fileBuffer,
            fileinfo,
          };
        }

        chunks.length = 0; // Clearing the chunks array
        log.debug(`File ${fileCount} parsed: ${fileinfo.filename}`);
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
      if (fieldname === 'baliseData') {
        form['baliseData'] = value;
      }
    });

    bb.on('finish', () => {
      // Add files array to form
      form.files = files;
      log.info(`File parsing completed: ${files.length} files processed`);
      resolve(form);
    });

    bb.on('error', (err) => {
      reject(err);
    });

    bb.end(buffer);
  });
};
