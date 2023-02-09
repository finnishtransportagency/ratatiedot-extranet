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

export interface AlfrescoResponse {
  entry: {
    isFile: boolean;
    createdByUser: {
      id: string;
      displayName: string;
    };
    modifiedAt: string;
    nodeType: typeof CM_CONTENT;
    content: {
      mimeType: string;
      mimeTypeName: string;
      sizeInBytes: number;
      encoding: string;
    };
    parentId: string;
    aspectNames: string[];
    createdAt: string;
    isFolder: false;
    modifiedByUser: {
      id: string;
      displayName: string;
    };
    name: string;
    id: string;
    properties: { 'cm:versionLabel': string; 'cm:versionType': string };
  };
}

// TODO: Unify any duplicate types/interfaces. See SearchParameter for example
