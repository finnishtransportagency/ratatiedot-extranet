export type QueryLanguages = typeof queryLanguagesMapping[keyof typeof queryLanguagesMapping];
export enum queryLanguagesMapping {
  LUCENE = 'lucene',
  CMIS = 'cmis',
}

export enum FileType {
  MSWORD = 'MSWORD',
  PDF = 'PDF',
}

export enum SearchParameterName {
  MODIFIED = 'modified',
  MIME = 'mime',
}

export type Query = {
  query: string;
  language: string;
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
  to: string;
}

export interface IMimeSearchParameter extends IBaseSearchParameter {
  parameterName: SearchParameterName.MIME;
  fileTypes: Array<FileType>;
}

export type SearchParameter = IModifiedSearchParameter | IMimeSearchParameter;

export type SearchParameters = Array<SearchParameter>;
