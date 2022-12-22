import { searchQueryBuilder } from '..';
import { QueryLanguage } from '../types';

describe('searchQueryBuilder', () => {
  it("don't have include alongside query if not given", () => {
    expect(searchQueryBuilder({ language: QueryLanguage.LUCENE, searchParameters: [], page: 0 })).toEqual({
      query: {
        language: 'lucene',
        query: '',
      },
      paging: {
        maxItems: 10,
        skipCount: 0,
      },
    });
  });
});
