import { log } from '../../../utils/logger';
import { lucenePagination, luceneQueryBuilder } from './luceneQueryBuilder';
import { QueryLanguage, SearchParameters, Query } from './types';

export const searchQueryBuilder = ({
  searchParameters,
  page = 0,
  language = QueryLanguage.LUCENE,
}: {
  searchParameters: SearchParameters;
  page: number;
  language: QueryLanguage;
}): Query => {
  switch (language) {
    case 'lucene':
      return {
        query: luceneQueryBuilder(searchParameters),
        language,
        paging: lucenePagination(page),
      };
    default:
      log.error(`Searchquery for ${language} not yet implemented.`);
      throw Error('Not yet implemented');
  }
};
