// TODO: Add necessary fields
export interface IFileRequestBody {
  // Is probably inside IFile, maybe
  fileName: string;
  file: IFile;
}

// TODO: Add necessary fields
export interface IFile {
  fileName: string;
}

// TODO: Add necessary fields
export type FileRequest = {
  file: IFile;
};
