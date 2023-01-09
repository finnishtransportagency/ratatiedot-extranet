import { Paging, SearchParameter, Sorting, SortingParameter } from './types';

export interface QueryBuilder {
  queryBuilder(searchParameters: Array<SearchParameter>): string;
  pagination(page?: number): Paging;
  sort(params?: SortingParameter | SortingParameter[]): [] | Sorting | Sorting[];
}
