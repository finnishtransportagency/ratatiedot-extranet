import { Paging, SearchParameter } from './types';

export interface SearchQueryBuilder {
  queryBuilder(searchParameters: Array<SearchParameter>): string;
  pagination(page?: number): Paging;
}
