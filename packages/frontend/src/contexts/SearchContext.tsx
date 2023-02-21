import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchParameterName } from '../components/Search/FilterSearchData';
import { SortDataType } from '../constants/Data';

export type Sorting = { field: string; ascending: boolean };
export type SortingParameters = Sorting[] | [];

export const SearchContext = React.createContext({
  query: '',
  queryHandler: (_: string) => {},
  savedCheckboxes: {
    [SearchParameterName.MIME]: [''],
    [SearchParameterName.CATEGORY]: [''],
  },
  savedCheckboxesHandler: (checkboxes: any) => {},
  years: [null, null],
  yearsHandler: (from: any, to: any) => {},
  page: 0,
  pageHandler: (page: number) => {},
  sort: [null],
  sortHandler: (_: string) => {},
  contentSearch: false,
  contentSearchHandler: (_: boolean) => {},
});

export const SearchContextProvider = (props: any) => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState<string>(() => {
    return searchParams.get('query') || '';
  });
  const [years, setYears] = useState<any[]>([]);
  const [savedCheckboxes, setSavedCheckboxes] = useState<{ [name in SearchParameterName]: string[] }>({
    [SearchParameterName.MIME]: [],
    [SearchParameterName.CATEGORY]: [],
  });
  const [page, setPage] = useState<number>(0);
  const [sort, setSort] = useState<any[]>([]);
  const [contentSearch, setContentSearch] = useState(false);

  useEffect(() => {
    queryHandler(searchParams.get('query') || '');
    yearsHandler(null, null);
    savedCheckboxesHandler({
      [SearchParameterName.MIME]: [],
      [SearchParameterName.CATEGORY]: [],
    });
    pageHandler(0);
    contentSearchHandler(false);
  }, [searchParams]);

  const queryHandler = (query: string) => {
    setQuery(query);
  };

  const yearsHandler = (from: any, to: any) => {
    setYears([from, to]);
  };

  const savedCheckboxesHandler = (checkboxes: any) => {
    return setSavedCheckboxes(checkboxes);
  };

  const pageHandler = (page: number) => {
    setPage(page);
  };

  const sortHandler = (type: string) => {
    const sortRequest = [];
    switch (type) {
      case SortDataType.ASC_NAME:
        sortRequest.push({ field: 'name', ascending: true });
        break;
      case SortDataType.DESC_NAME:
        sortRequest.push({ field: 'name', ascending: false });
        break;
      case SortDataType.ASC_MODIFIED:
        sortRequest.push({ field: 'modified', ascending: true });
        break;
      case SortDataType.DESC_MODIFIED:
        sortRequest.push({ field: 'modified', ascending: false });
        break;
      default:
        break;
    }
    setSort(sortRequest);
  };

  const contentSearchHandler = (contentSearch: boolean) => setContentSearch(contentSearch);

  return (
    <SearchContext.Provider
      value={{
        query: query,
        queryHandler: queryHandler,
        savedCheckboxes: savedCheckboxes,
        savedCheckboxesHandler: savedCheckboxesHandler,
        years: years,
        yearsHandler: yearsHandler,
        page: page,
        pageHandler: pageHandler,
        sort: sort,
        sortHandler: sortHandler,
        contentSearch: contentSearch,
        contentSearchHandler: contentSearchHandler,
      }}
    >
      {props.children}
    </SearchContext.Provider>
  );
};
