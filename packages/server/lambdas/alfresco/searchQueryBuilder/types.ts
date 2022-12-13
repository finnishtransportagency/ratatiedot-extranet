export enum QueryLanguage {
  LUCENE = 'lucene',
  CMIS = 'cmis',
}

export enum FileType {
  EXCEL = 'EXCEL',
  IMAGE = 'IMAGE',
  MSWORD = 'MSWORD',
  PDF = 'PDF',
  PRESENTATION = 'PRESENTATION',
  TXT = 'TXT',
}

export enum SearchParameterName {
  MODIFIED = 'modified',
  MIME = 'mime',
  NAME = 'name',
}

export type Query = {
  query: string;
  language: QueryLanguage;
  paging: Paging;
};

export type Paging = {
  maxItems: number;
  skipCount: number;
};

interface IBaseSearchParameter {
  parameterName: SearchParameterName;
}

export interface IModifiedSearchParameter extends IBaseSearchParameter {
  parameterName: SearchParameterName.MODIFIED;
  from: string;
  to?: string;
}

export interface IMimeSearchParameter extends IBaseSearchParameter {
  parameterName: SearchParameterName.MIME;
  fileTypes: Array<FileType>;
}

export interface INameSearchParameter extends IBaseSearchParameter {
  parameterName: SearchParameterName.NAME;
  fileName: string;
}

export type SearchParameter = IModifiedSearchParameter | IMimeSearchParameter | INameSearchParameter;
