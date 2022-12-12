import { log } from '../../../utils/logger';
import { lucenePagination, luceneQueryBuilder } from './luceneQueryBuilder';
import { queryLanguagesMapping, SearchParameters, QueryLanguages, Query } from './types';

export const searchQueryBuilder = ({
  searchParameters,
  page = 0,
  language = queryLanguagesMapping.LUCENE,
}: {
  searchParameters: SearchParameters;
  page: number;
  language: QueryLanguages;
}): Query => {
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
