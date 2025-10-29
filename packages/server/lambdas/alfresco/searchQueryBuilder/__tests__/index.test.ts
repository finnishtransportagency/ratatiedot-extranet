import { searchQueryBuilder } from '..';
import { QueryLanguage, SortingFieldParameter } from '../types';

describe('searchQueryBuilder', () => {
  it("don't have additionalFields alongside query if not given", () => {
    expect(
      searchQueryBuilder({
        language: QueryLanguage.LUCENE,
        searchParameters: [],
        page: 0,
        sort: { field: SortingFieldParameter.name, ascending: true },
      }),
    ).toEqual({
      query: {
        language: 'lucene',
        query: '',
      },
      paging: {
        maxItems: 50,
        skipCount: 0,
      },
      sort: [{ type: 'FIELD', field: 'cm:name', ascending: true }],
    });
  });
});
