import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchParameterName } from '../components/Search/FilterSearchData';

export const SearchContext = React.createContext({
  query: '',
  queryHandler: (_: string) => {},
  checkedList: {
    [SearchParameterName.MIME]: [''],
    [SearchParameterName.REGION]: [''],
    [SearchParameterName.MATERIAL_CLASS]: [''],
  },
  checkedListHandler: (checkboxes: any) => {},
  years: [null, null],
  yearsHandler: (from: any, to: any) => {},
  page: 0,
  pageHandler: (page: number) => {},
});

export const SearchContextProvider = (props: any) => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState<string>(() => {
    return searchParams.get('query') || '';
  });
  const [years, setYears] = useState<any[]>([]);
  const [checkedList, setCheckedList] = useState<{ [name in SearchParameterName]: string[] }>({
    [SearchParameterName.MIME]: [],
    [SearchParameterName.REGION]: [],
    [SearchParameterName.MATERIAL_CLASS]: [],
  });
  const [page, setPage] = useState<number>(0);

  const queryHandler = (query: string) => {
    setQuery(query);
  };

  const yearsHandler = (from: any, to: any) => {
    setYears([from, to]);
  };

  const checkedListHandler = (checkboxes: any) => {
    return setCheckedList(checkboxes);
  };

  const pageHandler = (page: number) => {
    setPage(page);
  };

  return (
    <SearchContext.Provider
      value={{
        query: query,
        queryHandler: queryHandler,
        checkedList: checkedList,
        checkedListHandler: checkedListHandler,
        years: years,
        yearsHandler: yearsHandler,
        page: page,
        pageHandler: pageHandler,
      }}
    >
      {props.children}
    </SearchContext.Provider>
  );
};
