import { ParsedFormDataOptions } from '../../../../../utils/parser';

const buffer = Buffer.alloc(5);

const parsedFormData: ParsedFormDataOptions = {
  filedata: buffer,
  fileinfo: {
    filename: 'file.pdf',
    encoding: 'utf8',
    mimeType: 'application/pdf',
  },
};

export const mockFormDataOptions = JSON.stringify(parsedFormData);
