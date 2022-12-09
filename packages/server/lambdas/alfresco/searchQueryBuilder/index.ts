import { log } from '../../../utils/logger';
import { lucenePagination, luceneQueryBuilder } from './luceneQueryBuilder';

export type QueryLanguages = typeof queryLanguagesMapping[keyof typeof queryLanguagesMapping];
export const queryLanguagesMapping = {
  LUCENE: 'lucene',
  CMIS: 'cmis',
} as const;

export type FileTypes = 'MSWORD' | 'PDF';

export type SearchParameterNames = 'modified' | 'mime';

export type Query = {
  query: string;
  language: string;
};

interface IBaseSearchParameter {
  parameterName: SearchParameterNames;
}

export interface IModifiedSearchParameter extends IBaseSearchParameter {
  from: string;
  to: string;
}

export interface IMimeSearchParameter extends IBaseSearchParameter {
  fileTypes: Array<FileTypes>;
}

export type SearchParameter = IModifiedSearchParameter | IMimeSearchParameter;

export type SearchParameters = Array<SearchParameter>;

export const searchQueryBuilder = ({
  searchParameters,
  page = 0,
  language = queryLanguagesMapping.LUCENE,
}: {
  searchParameters: SearchParameters;
  page: number;
  language: QueryLanguages;
}) => {
  switch (language) {
    case 'lucene':
      return {
        query: luceneQueryBuilder(searchParameters),
        language: queryLanguagesMapping.LUCENE,
        paging: lucenePagination(page),
      };
    default:
      log.error(`Searchquery for ${language} not yet implemented.`);
      throw Error('Not yet implemented');
  }
};
