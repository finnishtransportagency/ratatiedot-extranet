import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Fragment, useContext } from 'react';

import { Colors } from '../../constants/Colors';
import { AppBarContext } from '../../contexts/AppBarContext';
import { MenuContext } from '../../contexts/MenuContext';

import { IMenuItem, MenuItems } from './MenuItems';

export const MenuList = () => {
  const { openDrawer, toggleDrawer } = useContext(AppBarContext);
  const { menu, menuHandler } = useContext(MenuContext);

  const categoryHandler = (key: string) => {
    menuHandler(key);
    if (!openDrawer) {
      toggleDrawer();
    }
  };

  return (
    <>
      {MenuItems.map((item: IMenuItem) => {
        const { key, primary, icon, to, children } = item;
        return (
          <Fragment key={key}>
            <ListItem disablePadding alignItems="flex-start" onClick={() => categoryHandler(key)}>
              <ListItemButton href={to ? to : ''}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={primary} sx={{ opacity: openDrawer ? 1 : 0 }} />
                {children && (menu[key as never] ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </ListItem>
            {children &&
              menu[key as never] &&
              children.map((child: IMenuItem) => {
                return (
                  <ListItemButton
                    sx={{ pl: 9, whiteSpace: 'normal', flexGrow: 'unset', backgroundColor: Colors.lightgrey }}
                    key={child.key}
                    href={child.to ? child.to : ''}
                  >
                    <ListItemText primary={child.primary} />
                  </ListItemButton>
                );
              })}
          </Fragment>
        );
      })}
    </>
  );
};
