import React, { useState } from 'react';
import { ESearchParameterName } from '../components/Search/FilterSearchData';

export const SearchContext = React.createContext({
  query: '',
  queryHandler: (_: string) => {},
  checkedList: {
    [ESearchParameterName.MIME]: [''],
    [ESearchParameterName.REGION]: [''],
    [ESearchParameterName.MATERIAL_CLASS]: [''],
  },
  checkedListHandler: (checkboxes: any) => {},
  years: [null, null],
  yearsHandler: (from: any, to: any) => {},
});

export const SearchContextProvider = (props: any) => {
  const [query, setQuery] = useState('');
  const [years, setYears] = useState<any[]>([]);
  const [checkedList, setCheckedList] = useState<{ [name in ESearchParameterName]: string[] }>({
    [ESearchParameterName.MIME]: [],
    [ESearchParameterName.REGION]: [],
    [ESearchParameterName.MATERIAL_CLASS]: [],
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
