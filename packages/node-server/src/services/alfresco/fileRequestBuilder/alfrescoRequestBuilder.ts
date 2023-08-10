import FormData from 'form-data';
import { Request } from 'express';
import { FileInfo } from 'busboy';
import { log } from '../../../utils/logger.js';

// Copied from parser
export interface ParsedFormDataOptions {
  [key: string]: string | Buffer | FileInfo;
}

const createForm = (requestFormData: ParsedFormDataOptions): FormData => {
  const formData = new FormData();
  const fileData: Buffer = requestFormData.filedata as Buffer;
  const fileInfo = requestFormData.fileinfo as FileInfo;
  const description = requestFormData['cm:description'];
  const title = requestFormData['cm:title'];
  log.debug(`File data buffer size: ${fileData.length}`);
  formData.append('filedata', fileData, { filename: fileInfo.filename });
  formData.append('name', fileInfo.filename);
  formData.append('nodeType', 'cm:content');
  if (description) formData.append('cm:description', description);
  if (title) formData.append('cm:title', title);
  return formData;
};

const parseForm = (reqFile: Express.Multer.File, body: Record<string, string | undefined>): ParsedFormDataOptions => {
  // convert the filename to utf-8 since latin1 preserves individual bytes
  const filename = Buffer.from(body.name, 'latin1').toString('utf8');
  const originalname = Buffer.from(reqFile.originalname, 'latin1').toString('utf8');

  console.log('originalname utf8: ', originalname);

  const form = {
    filedata: reqFile.buffer,
    fieldname: reqFile.fieldname,
    fileinfo: {
      filename: originalname,
      encoding: reqFile.encoding,
      mimeType: reqFile.mimetype,
    },
  };

  console.log('form.fileinfo.filename: ', form.fileinfo.filename);
  const description = body['cm:description'];
  const title = body['cm:title'];
  if (description) {
    form['cm:description'] = description;
  }
  if (title) {
    form['cm:title'] = title;
  }
  // User has changed the filename, check if file extension is intact and append it if needed
  if (filename !== originalname) {
    const fileExtension = originalname.substring(originalname.lastIndexOf('.'));
    const dotIndex = filename.lastIndexOf('.');
    if (dotIndex !== -1) {
      const newFileName = filename.substring(0, dotIndex).trim() + fileExtension;
      form.fileinfo.filename = Buffer.from(newFileName, 'latin1').toString('utf8');
    } else {
      const newFileName = filename.trim() + fileExtension;
      form.fileinfo.filename = Buffer.from(newFileName, 'latin1').toString('utf8');
    }
  }
  return form;
};

export class AlfrescoFileRequestBuilder {
  public async requestBuilder(req: Request, headers: Record<string, string | undefined>) {
    const file = req.file;
    const body = req.body;
    const formData = parseForm(file, body);
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
}
