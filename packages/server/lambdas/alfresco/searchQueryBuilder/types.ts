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
  PARENT = 'parent',
  CATEGORY = 'category', // aineistoluokka folder name
}

export type QueryRequest = {
  searchParameters: Array<SearchParameter>;
  page?: number;
  language: QueryLanguage;
  additionalFields?: Array<AdditionalFields>;
  sort?: Array<SortingParameter>;
};

export type Query = {
  additionalFields?: Array<AdditionalFields>;
  query: {
    query: string;
    language: QueryLanguage;
  };
  paging: Paging;
  sort?: Sorting | Array<Sorting>;
};

export type Paging = {
  maxItems: number;
  skipCount: number;
};

export enum AdditionalFields {
  PROPERTIES = 'properties',
}

export enum SortingFieldParameter {
  name = 'name',
  modified = 'modified',
}

export type SortingParameter = {
  field: SortingFieldParameter;
  ascending: boolean;
};

export interface Sorting {
  type: 'FIELD';
  field: string;
  ascending: boolean;
}

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
  term: string;
  contentSearch?: boolean;
}

export interface IParentSearchParameter extends IBaseSearchParameter {
  parameterName: SearchParameterName.PARENT;
  parent: string;
}

export interface ICategorySearchParameter extends IBaseSearchParameter {
  parameterName: SearchParameterName.CATEGORY;
  categoryName: string;
}

export type SearchParameter =
  | IModifiedSearchParameter
  | IMimeSearchParameter
  | INameSearchParameter
  | IParentSearchParameter
  | ICategorySearchParameter;
