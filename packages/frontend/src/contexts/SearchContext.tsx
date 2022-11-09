import React, { useState } from 'react';

export const SearchContext = React.createContext({
  query: '',
  queryHandler: (_: string) => {},
});

export const SearchContextProvider = (props: any) => {
  const [query, setQuery] = useState('');

  const queryHandler = (query: string) => {
    setQuery(query);
  };

  return (
    <SearchContext.Provider value={{ query: query, queryHandler: queryHandler }}>
      {props.children}
    </SearchContext.Provider>
  );
};
