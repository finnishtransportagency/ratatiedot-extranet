import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import React, { useContext } from 'react';

import { Colors } from '../../constants/Colors';
import { AppBarContext } from '../../contexts/AppBarContext';
import { MenuContext } from '../../contexts/MenuContext';

import { IMenuItem, MenuItems } from './MenuItems';

export const MenuList = () => {
  const { openDrawer } = useContext(AppBarContext);
  const { menu, menuHandler } = useContext(MenuContext);

  return (
    <>
      {MenuItems.map((item: IMenuItem) => {
        const { key, primary, icon, to, children } = item;
        return (
          <React.Fragment key={key}>
            <ListItem disablePadding alignItems="flex-start" onClick={() => menuHandler(key)}>
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
          </React.Fragment>
        );
      })}
    </>
  );
};
