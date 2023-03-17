import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useGetUserRightPageContent } from '../hooks/query/GetUserRightPageContent';
import { getRouteName } from '../utils/helpers';

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
  userRight: { canRead: false, canWrite: false },
  userRightHandler: (_: TUserRight) => {},
});

export type TUserRight = { canRead: boolean; canWrite: boolean };

export const AppBarContextProvider = (props: any) => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openToolbar, setOpenToolbar] = useState(false);
  const [userRight, setUserRight] = useState<TUserRight>({ canRead: false, canWrite: false });

  const location = useLocation();
  const categoryName = getRouteName(location);
  const { data } = useGetUserRightPageContent(categoryName);

  useEffect(() => {
    if (data) {
      setUserRight(data);
    }
  }, [data]);

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

  const userRightHandler = (userRight: TUserRight) => {
    setUserRight(userRight);
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
        userRight: userRight,
        userRightHandler: userRightHandler,
      }}
    >
      {props.children}
    </AppBarContext.Provider>
  );
};
