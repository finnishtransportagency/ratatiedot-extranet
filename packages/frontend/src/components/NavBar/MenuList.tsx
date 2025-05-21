import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Fragment, useContext } from 'react';
import { Colors } from '../../constants/Colors';
import { AppBarContext } from '../../contexts/AppBarContext';
import { IMenuItem, MenuContext } from '../../contexts/MenuContext';
import { useMenuItemStore } from '../../store/menuItemStore';
import { useLocation, Link } from 'react-router-dom';
import { capitalize } from 'lodash';
import { getRouterName } from '../../utils/helpers';
import { theme } from '../../styles/createTheme';
import { useTranslation } from 'react-i18next';

export const MenuList = () => {
  const { t } = useTranslation(['common']);
  const { openMiniDrawer, openDesktopDrawer } = useContext(AppBarContext);
  const { menu, menuItems } = useContext(MenuContext);

  const openMenuItems = useMenuItemStore((state) => state.openMenuItems);
  // const openMenuItemArray = ['Liikennöinti']
  const addMenuItem = useMenuItemStore((state) => state.addMenuItem);
  const removeMenuItem = useMenuItemStore((state) => state.removeMenuItem);

  const toggleMenuItemOpen = (key: string) => (openMenuItems.includes(key) ? removeMenuItem(key) : addMenuItem(key));

  const { pathname } = useLocation();
  const routeName = getRouterName(pathname).split('/').filter(Boolean)[0];

  return (
    <>
      {menuItems.map((item: IMenuItem) => {
        const { key, primary, icon, to, children } = item;

        const selected =
          (key !== t('common:menu.logout') && capitalize(getRouterName(primary as string)) === capitalize(routeName)) ||
          (key === t('common:menu.frontpage') && pathname === '/');
        return (
          <Fragment key={key}>
            <ListItem disablePadding alignItems="flex-start" onClick={() => toggleMenuItemOpen(key)}>
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
                    opacity: openDesktopDrawer || openMiniDrawer ? 1 : 0,
                    '.MuiListItemText-primary': {
                      fontFamily: selected ? 'Exo2-Bold' : 'Exo2-Regular',
                    },
                  }}
                />
                {children && (menu[key as never] ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </ListItem>
            {children &&
              openMenuItems.includes(key) &&
              children.map((child: IMenuItem) => {
                const selected = child.to === pathname;
                return (
                  <ListItemButton
                    component={Link}
                    to={child.to ? child.to : ''}
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
                    selected={child.to === pathname}
                  >
                    <ListItemText
                      primary={child.primary}
                      sx={{
                        '.MuiListItemText-primary': {
                          fontFamily: selected ? 'Exo2-Bold' : 'Exo2-Regular',
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
