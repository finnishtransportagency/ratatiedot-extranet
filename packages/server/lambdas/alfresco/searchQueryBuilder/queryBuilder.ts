import { Paging, SearchParameter } from './types';

export interface QueryBuilder {
  queryBuilder(searchParameters: Array<SearchParameter>): string;
  pagination(page?: number): Paging;
}
