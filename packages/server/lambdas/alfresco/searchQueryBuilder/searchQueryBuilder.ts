import { Paging, SearchParameter, Sorting, SortingParameter } from './types';

export interface SearchQueryBuilder {
  queryBuilder(searchParameters: Array<SearchParameter>): string;
  pagination(page?: number): Paging;
  sorting(params?: SortingParameter): [] | Sorting[];
}
