import styled from '@emotion/styled';
import { Box, Drawer, DrawerProps, Typography } from '@mui/material';
import MuiAppBar, { AppBarProps } from '@mui/material/AppBar';
import { Theme, CSSObject } from '@mui/material/styles';
// import MuiDrawer, { DrawerProps } from '@mui/material/Drawer';

import { Colors } from '../../constants/Colors';

interface AppBarWrapperProps extends AppBarProps {
  open?: boolean;
}

const drawerWidth = 306;

export const LogoTextWrapper = styled(Typography)(() => ({
  fontSize: '18px',
})) as typeof Typography;

export const LogoImageWrapper = styled(Box)(() => ({
  width: '40px',
  height: '40px',
})) as typeof Box;

export const MobileAppBarWrapper = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarWrapperProps>(({ theme, open }) => {
  return {
    zIndex: theme.zIndex.drawer + 1,
    [theme.breakpoints.down('tablet')]: {
      boxShadow: `0px 3px ${Colors.lightblue}`,
    },
    [theme.breakpoints.up('tablet')]: {
      boxShadow: `${open ? `${drawerWidth}px` : '0px'} 3px ${Colors.lightblue}`,
    },
    [theme.breakpoints.up('desktop')]: {
      display: 'none',
    },
  };
});

export const DesktopAppBarWrapper = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarWrapperProps>(({ theme, open }) => {
  return {
    // zIndex: theme.zIndex.drawer + 1,
    [theme.breakpoints.down('desktop')]: {
      display: 'none',
    },
    [theme.breakpoints.up('desktop')]: {
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }),
    },
  };
});

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

interface DrawerWrapperProps extends DrawerProps {
  open?: boolean;
}

export const DrawerWrapper = styled(Drawer)(({ theme }) => {
  // console.log(open);
  return {
    [theme.breakpoints.down('tablet')]: {
      '& .MuiPaper-root': {
        width: '100%',
      },
    },
    [theme.breakpoints.up('tablet')]: {
      '& .MuiPaper-root': {
        width: '306px',
        borderColor: Colors.lightblue,
        borderWidth: '3px',
      },
    },
    '& li:last-child': {
      position: 'fixed',
      bottom: '16px',
      '& .MuiListItemIcon-root': {
        color: Colors.darkblue,
      },
      '& .MuiListItemText-root': {
        color: Colors.darkblue,
      },
    },
    // width: drawerWidth,
    // flexShrink: 0,
    // whiteSpace: 'nowrap',
    // boxSizing: 'border-box',

    // '& .MuiDrawer-paper': openedMixin(theme),
    // ...(open && {
    //   '& .MuiDrawer-paper': {
    //     width: drawerWidth,
    //     transition: theme.transitions.create('width', {
    //       easing: theme.transitions.easing.sharp,
    //       duration: theme.transitions.duration.enteringScreen,
    //     }),
    //     overflowX: 'hidden',
    //   },
    //   // ...openedMixin(theme),
    //   // '& .MuiDrawer-paper': openedMixin(theme),
    // }),
    // ...(!open && {
    //   // ...closedMixin(theme),
    //   // '& .MuiDrawer-paper': closedMixin(theme),
    //   transition: theme.transitions.create('width', {
    //     easing: theme.transitions.easing.sharp,
    //     duration: theme.transitions.duration.leavingScreen,
    //   }),
    //   overflowX: 'hidden',
    //   width: `calc(${theme.spacing(7)} + 1px)`,
    //   [theme.breakpoints.up('tablet')]: {
    //     width: `calc(${theme.spacing(8)} + 1px)`,
    //   },
    // }),
  };
});
