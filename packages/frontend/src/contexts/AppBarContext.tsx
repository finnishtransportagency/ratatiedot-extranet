import React, { useState } from 'react';

export const AppBarContext = React.createContext({
  openDrawer: false,
  toggleDrawer: () => {},
  openSearch: false,
  toggleSearch: () => {},
  openFilter: false,
  toggleFilter: () => {},
  openEdit: false,
  toggleEdit: () => {},
  openToolbar: false,
  openToolbarHandler: () => {},
  closeToolbarHandler: () => {},
});

export const AppBarContextProvider = (props: any) => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openToolbar, setOpenToolbar] = useState(false);

  const toggleDrawer = () => setOpenDrawer(!openDrawer);
  const toggleSearch = () => {
    setOpenDrawer(false);
    setOpenEdit(false);
    setOpenSearch(!openSearch);
  };
  const toggleFilter = () => {
    setOpenDrawer(false);
    setOpenEdit(false);
    setOpenFilter(!openFilter);
  };

  const toggleEdit = () => {
    setOpenDrawer(false);
    setOpenEdit(!openEdit);
  };

  const openToolbarHandler = () => {
    setOpenEdit(false);
    setOpenToolbar(true);
  };

  const closeToolbarHandler = () => {
    setOpenEdit(true);
    setOpenToolbar(false);
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
        openEdit: openEdit,
        toggleEdit: toggleEdit,
        openToolbar: openToolbar,
        openToolbarHandler: openToolbarHandler,
        closeToolbarHandler: closeToolbarHandler,
      }}
    >
      {props.children}
    </AppBarContext.Provider>
  );
};
