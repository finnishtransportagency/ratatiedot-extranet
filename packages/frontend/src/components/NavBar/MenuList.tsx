import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { ListItem, ListItemButton, ListItemIcon, ListItemText, styled } from '@mui/material';
import { Fragment, useContext } from 'react';
import { ListItemButtonProps } from '@mui/material/ListItemButton';
import { Colors } from '../../constants/Colors';
import { AppBarContext } from '../../contexts/AppBarContext';
import { MenuContext } from '../../contexts/MenuContext';
import { IMenuItem, MenuItems } from './MenuItems';
import { useLocation } from 'react-router-dom';
import { capitalize } from 'lodash';
import { getRouterName } from '../../utils/helpers';
import { theme } from '../../styles/createTheme';

export interface StyledListItemButtonProps extends ListItemButtonProps {
  href?: string;
}

export const MenuList = () => {
  const { openDrawer, toggleDrawer } = useContext(AppBarContext);
  const { menu, menuHandler } = useContext(MenuContext);

  const categoryHandler = (key: string) => {
    menuHandler(key);
    if (!openDrawer) {
      toggleDrawer();
    }
  };
  const { pathname } = useLocation();
  const routeName = getRouterName(pathname).split('/').filter(Boolean)[0];

  return (
    <>
      {MenuItems.map((item: IMenuItem) => {
        const { key, primary, icon, to, children } = item;

        const selected =
          (key !== 'Logout' && capitalize(getRouterName(primary as string)) === capitalize(routeName)) ||
          (key === 'Landing' && pathname === '/');
        return (
          <Fragment key={key}>
            <ListItem disablePadding alignItems="flex-start" onClick={() => categoryHandler(key)}>
              <ListItemButton
                href={to ? to : ''}
                selected={selected}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: '#fff',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      backgroundColor: Colors.midblue,
                    },
                    '&.MuiListItemButton-root:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  },
                }}
              >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText
                  primary={primary}
                  sx={{
                    opacity: openDrawer ? 1 : 0,
                    '.MuiListItemText-primary': {
                      fontWeight: selected ? 'bold' : 'normal',
                    },
                  }}
                />
                {children && (menu[key as never] ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </ListItem>
            {children &&
              menu[key as never] &&
              children.map((child: IMenuItem) => {
                const selected = child.to === pathname;
                return (
                  <ListItemButton
                    sx={{
                      pl: 9,
                      whiteSpace: 'normal',
                      flexGrow: 'unset',
                      backgroundColor: Colors.lightgrey,
                      '&.Mui-selected': {
                        backgroundColor: Colors.midgrey,
                        '&.MuiListItemButton-root:hover': {
                          backgroundColor: theme.palette.action.hover,
                        },
                      },
                    }}
                    key={child.key}
                    href={child.to ? child.to : ''}
                    selected={child.to === pathname}
                  >
                    <ListItemText
                      primary={child.primary}
                      sx={{
                        '.MuiListItemText-primary': {
                          fontWeight: selected ? 'bold' : 'normal',
                        },
                      }}
                    />
                  </ListItemButton>
                );
              })}
          </Fragment>
        );
      })}
    </>
  );
};
