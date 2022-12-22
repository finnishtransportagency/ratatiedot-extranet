import { log } from '../../../utils/logger';
import { LuceneQueryBuilder } from './luceneQueryBuilder';
import { QueryLanguage, Query, SearchParameter, Include } from './types';

export const searchQueryBuilder = ({
  searchParameters,
  page = 0,
  language = QueryLanguage.LUCENE,
  include,
}: {
  searchParameters: Array<SearchParameter>;
  page: number;
  language: QueryLanguage;
  include?: Array<Include>;
}): Query => {
  switch (language) {
    case QueryLanguage.LUCENE:
      const luceneQueryBuilder = new LuceneQueryBuilder();
      return {
        query: {
          query: luceneQueryBuilder.queryBuilder(searchParameters),
          // TODO: ANCESTOR? Might not be needed
          language,
        },
        paging: luceneQueryBuilder.pagination(page),
        ...(include && { include: luceneQueryBuilder.include(include) }),
      };
    default:
      log.error(`Searchquery for ${language} not yet implemented.`);
      throw Error('Not yet implemented');
  }
};
