import { log } from '../../../utils/logger';
import { LuceneQueryBuilder } from './luceneQueryBuilder';
import { QueryLanguage, Query, SearchParameter, AdditionalFields } from './types';

export const searchQueryBuilder = ({
  searchParameters,
  page = 0,
  language = QueryLanguage.LUCENE,
  additionalFields,
}: {
  searchParameters: Array<SearchParameter>;
  page: number;
  language: QueryLanguage;
  additionalFields?: Array<AdditionalFields>;
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
        ...(additionalFields && { additionalFields: luceneQueryBuilder.additionalFields(additionalFields) }),
      };
    default:
      log.error(`Searchquery for ${language} not yet implemented.`);
      throw Error('Not yet implemented');
  }
};
