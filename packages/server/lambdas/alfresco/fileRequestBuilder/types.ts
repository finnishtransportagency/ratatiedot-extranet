// TODO: Add necessary fields
// Might need renaming. Result depends on if upload and update use same fields or not
export interface IFileRequestBody {
  // Is probably inside IFile, maybe
  fileName: string;
  file: IFile;
  category: string;
}

// TODO: Add necessary fields
export interface IFile {
  fileName: string;
}

// TODO: Add necessary fields
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
