// TODO: Add necessary fields
// Might need renaming. Result depends on if upload and update use same fields or not

const CM_CONTENT = 'cm:content';

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
