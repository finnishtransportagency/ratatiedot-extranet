import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useState } from 'react';
import { Colors } from '../../constants/Colors';

import { IMenuItem, MenuItems } from './MenuItems';

type MenuListProps = {
  open: boolean;
};

export const MenuList = ({ open }: MenuListProps) => {
  const resetMenu = () => {
    let menuData = {};
    MenuItems.forEach((item: IMenuItem) => {
      menuData = {
        ...menuData,
        [item.key]: false,
      };
    });
    return menuData;
  };

  const [menu, setMenu] = useState<{ [key: string]: boolean }>(resetMenu);

  const handleClick = (key: string) => {
    setMenu({ ...menu, [key]: !menu[key] });
  };

  return (
    <>
      {MenuItems.map((item: IMenuItem) => {
        const { key, primary, icon, to, children } = item;
        return (
          <>
            <ListItem disablePadding key={key} alignItems="flex-start" onClick={() => handleClick(key)}>
              <ListItemButton href={to ? to : ''}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={primary} sx={{ opacity: open ? 1 : 0 }} />
                {children && (menu[key] ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </ListItem>
            {children &&
              menu[key] &&
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
          </>
        );
      })}
    </>
  );
};
