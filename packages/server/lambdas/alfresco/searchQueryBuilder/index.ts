import { log } from '../../../utils/logger';
import { lucenePagination, luceneQueryBuilder } from './luceneQueryBuilder';
import { QueryLanguage, Query, SearchParameter } from './types';

export const searchQueryBuilder = ({
  searchParameters,
  page = 0,
  language = QueryLanguage.LUCENE,
}: {
  searchParameters: Array<SearchParameter>;
  page: number;
  language: QueryLanguage;
}): Query => {
  switch (language) {
    case QueryLanguage.LUCENE:
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
