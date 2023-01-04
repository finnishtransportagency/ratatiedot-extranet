import React, { useState } from 'react';
import { IMenuItem, MenuItems } from '../components/NavBar/MenuItems';

export const MenuContext = React.createContext({
  menu: {},
  resetMenu: () => {},
  menuHandler: (_: string) => {},
});

export const MenuContextProvider = (props: any) => {
  const initMenu = () => {
    let menuData = {};
    MenuItems.forEach((item: IMenuItem) => {
      menuData = {
        ...menuData,
        [item.key]: false,
      };
    });
    return menuData;
  };

  const [menu, setMenu] = useState<{ [key: string]: boolean }>(initMenu);

  const menuHandler = (key: string) => {
    setMenu({ ...menu, [key]: !menu[key] });
  };

  const resetMenu = () => {
    setMenu(initMenu);
  };

  return (
    <MenuContext.Provider
      value={{
        menu: menu,
        resetMenu: resetMenu,
        menuHandler: menuHandler,
      }}
    >
      {props.children}
    </MenuContext.Provider>
  );
};
