import { format } from 'date-fns';
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

  const queryHandler = (query: string) => {
    setQuery(query);
  };

  const yearsHandler = (from: any, to: any) => {
    setYears([from, to]);
  };

  const checkedListHandler = (checkboxes: any) => {
    return setCheckedList(checkboxes);
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
      }}
    >
      {props.children}
    </SearchContext.Provider>
  );
};
