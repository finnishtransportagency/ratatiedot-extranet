// TODO: Add necessary fields
// Might need renaming. Result depends on if upload and update use same fields or not

const CM_CONTENT = 'cm:content';
export interface IFileRequestBody {
  name: string;
  filedata: string;
  nodeType: typeof CM_CONTENT;
}

// TODO: Add necessary fields
export interface IFile {
  name: string;
}

// TODO: Add necessary fields
export type IFileResponse = {
  file: IFile;
};

export type FileRequest = {
  file: IFile;
};

export type FileDeleteRequestBody = {
  fileName: string;
  category: string;
};

// TODO: Add necessary fields
export type FileDeleteRequest = {
  fileName: string;
};

export enum FileStore {
  ALFRESCO = 'alfresco',
}

// TODO: Unify any duplicate types/interfaces. See SearchParameter for example
