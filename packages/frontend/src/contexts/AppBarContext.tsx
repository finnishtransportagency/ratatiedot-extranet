import React, { useState } from 'react';

export const AppBarContext = React.createContext({
  openDrawer: false,
  toggleDrawer: () => {},
  openSearch: false,
  toggleSearch: () => {},
  openFilter: false,
  toggleFilter: () => {},
});

export const AppBarContextProvider = (props: any) => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  const toggleDrawer = () => setOpenDrawer(!openDrawer);
  const toggleSearch = () => {
    setOpenDrawer(false);
    setOpenSearch(!openSearch);
  };
  const toggleFilter = () => {
    setOpenDrawer(false);
    setOpenFilter(!openFilter);
  };

  return (
    <AppBarContext.Provider
      value={{
        openDrawer: openDrawer,
        toggleDrawer: toggleDrawer,
        openSearch: openSearch,
        toggleSearch: toggleSearch,
        openFilter: openFilter,
        toggleFilter: toggleFilter,
      }}
    >
      {props.children}
    </AppBarContext.Provider>
  );
};
