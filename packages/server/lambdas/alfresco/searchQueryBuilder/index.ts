import { log } from '../../../utils/logger';
import { LuceneQueryBuilder } from './luceneQueryBuilder';
import { QueryLanguage, Query, QueryRequest } from './types';

export const searchQueryBuilder = ({
  searchParameters,
  page = 0,
  language = QueryLanguage.LUCENE,
  additionalFields,
  sort = [],
}: QueryRequest): Query => {
  switch (language) {
    case QueryLanguage.LUCENE:
      const luceneQueryBuilder = new LuceneQueryBuilder('/app:company_home/st:sites/cm:ratat-extra//*');
      return {
        query: {
          query: luceneQueryBuilder.queryBuilder(searchParameters),
          // TODO: ANCESTOR? Might not be needed
          language,
        },
        paging: luceneQueryBuilder.pagination(page),
        sort: luceneQueryBuilder.sorting(sort),
        ...(additionalFields && { include: luceneQueryBuilder.additionalFields(additionalFields) }),
      };
    default:
      log.error(`Searchquery for ${language} not yet implemented.`);
      throw Error('Not yet implemented');
  }
};
