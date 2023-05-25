import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useGetUserRightPageContent } from '../hooks/query/GetUserRightPageContent';
import { getCategoryRouteName } from '../routes';

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
  closeToolbarWithoutSaveHandler: () => {},
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
  const categoryName = getCategoryRouteName(location);
  const { area = '' } = useParams<{ area: string }>();
  const { data } = useGetUserRightPageContent(!area ? categoryName : area);

  useEffect(() => {
    if (data) {
      setUserRight(data);
    } else {
      userRightHandler({ canRead: false, canWrite: false });
      closeEdit();
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

  const closeEdit = () => {
    setOpenEdit(false);
  };

  const closeToolbarWithoutSaveHandler = () => {
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
        closeToolbarWithoutSaveHandler: closeToolbarWithoutSaveHandler,
        userRight: userRight,
        userRightHandler: userRightHandler,
      }}
    >
      {props.children}
    </AppBarContext.Provider>
  );
};
