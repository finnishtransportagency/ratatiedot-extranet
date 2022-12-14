import { log } from '../../../utils/logger';
import { LuceneQueryBuilder } from './luceneQueryBuilder';
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
      const luceneQueryBuilder = new LuceneQueryBuilder();
      return {
        query: {
          query: luceneQueryBuilder.queryBuilder(searchParameters),
          language,
        },
        paging: luceneQueryBuilder.pagination(page),
      };
    default:
      log.error(`Searchquery for ${language} not yet implemented.`);
      throw Error('Not yet implemented');
  }
};
