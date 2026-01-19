import { ListItem, ListItemButton, ListItemIcon, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import styled from '@emotion/styled';
import MuiDrawer, { DrawerProps } from '@mui/material/Drawer';
import { Theme, CSSObject } from '@mui/material/styles';

import { Colors } from '../../constants/Colors';
import RataExtLogo from '../../assets/images/Logo_noText.png';
import { MenuList } from './MenuList';
import { drawerWidth } from '../../constants/Viewports';
import { useContext } from 'react';
import { useMenuItemStore } from '../../store/menuItemStore';
import { AppBarContext } from '../../contexts/AppBarContext';
import { MenuContext } from '../../contexts/MenuContext';
import { Link } from 'react-router-dom';
import { Routes } from '../../constants/Routes';

export const DesktopDrawer = () => {
  const { openDesktopDrawer, toggleDesktopDrawer } = useContext(AppBarContext);
  const { resetMenu } = useContext(MenuContext);

  const wipeMenuItems = useMenuItemStore((state) => state.wipeMenuItems);

  const resetMenuAndToggleDrawer = () => {
    if (openDesktopDrawer) {
      resetMenu();
    }
    toggleDesktopDrawer();
    wipeMenuItems();
  };

  return (
    <DesktopDrawerWrapper variant="permanent" anchor="left" open={openDesktopDrawer}>
      <Link to={Routes.HOME} style={{ textDecoration: 'none', boxShadow: 'none', color: Colors.extrablack }}>
        <Toolbar>
          <Typography component="img" src={RataExtLogo} alt="Logo" sx={{ width: '65px', height: '65px' }} />
          <Typography sx={{ fontSize: '18px', opacity: openDesktopDrawer ? 1 : 0 }}>RATATIET0</Typography>
        </Toolbar>
      </Link>
      <ListItem
        key={openDesktopDrawer ? 'Close drawer' : 'Open drawer'}
        disablePadding
        onClick={resetMenuAndToggleDrawer}
      >
        <ListItemButton aria-label={openDesktopDrawer ? 'close desktop drawer' : 'open desktop drawer'}>
          <ListItemIcon>
            {openDesktopDrawer ? <ArrowBackIcon color="primary" /> : <MenuIcon color="primary" />}
          </ListItemIcon>
        </ListItemButton>
      </ListItem>
      <MenuList />
    </DesktopDrawerWrapper>
  );
};

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('tablet')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

export interface DrawerWrapperProps extends DrawerProps {
  open?: boolean;
  openedit?: boolean;
  opentoolbar?: boolean;
}
export const DesktopDrawerWrapper = styled(MuiDrawer)<DrawerWrapperProps>(({ theme, open }) => {
  return {
    [theme.breakpoints.down('desktop')]: {
      display: 'none',
    },
    [theme.breakpoints.up('desktop')]: {
      '& .MuiPaper-root': {
        borderColor: Colors.lightblue,
        borderWidth: '3px',
      },
      flexShrink: 0,
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
      ...((open && {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme),
      }) as any),
      ...((!open && {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme),
      }) as any),

      // Extranet link should be the last list item
      '& li:last-child': {
        width: open ? `${drawerWidth}px` : `calc(${theme.spacing(8)} + 1px)`,
        '& .MuiListItemIcon-root': {
          color: Colors.darkblue,
        },
        '& .MuiListItemText-root': {
          color: Colors.darkblue,
        },
      },
    },
  };
});
