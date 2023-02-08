import { Paging, SearchParameter, Sorting, SortingParameter } from './types';

export interface QueryBuilder {
  queryBuilder(searchParameters: Array<SearchParameter>): string;
  pagination(page?: number): Paging;
  sorting(params?: SortingParameter | SortingParameter[]): [] | Sorting | Sorting[];
}
