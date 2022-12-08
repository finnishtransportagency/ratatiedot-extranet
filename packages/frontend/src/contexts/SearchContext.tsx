import React, { useState } from 'react';

export const SearchContext = React.createContext({
  query: '',
  queryHandler: (_: string) => {},
  checkedList: [''],
  checkedListHandler: (itemName: string) => {},
});

export const SearchContextProvider = (props: any) => {
  const [query, setQuery] = useState('');
  const [checkedList, setcheckedList] = useState<string[]>([]);

  const queryHandler = (query: string) => {
    setQuery(query);
  };

  // TODO: checkedList should be arranged based on category, currently use string array
  // TODO: check nested check box list: if check 2020-2022 --> add 2020 to 2022
  const checkedListHandler = (itemName: string) => {
    const nameIndex = checkedList.indexOf(itemName);
    if (nameIndex === -1) return setcheckedList([...checkedList, itemName]);
    return setcheckedList(checkedList.filter((name) => name !== itemName));
  };

  return (
    <SearchContext.Provider
      value={{
        query: query,
        queryHandler: queryHandler,
        checkedList: checkedList,
        checkedListHandler: checkedListHandler,
      }}
    >
      {props.children}
    </SearchContext.Provider>
  );
};
