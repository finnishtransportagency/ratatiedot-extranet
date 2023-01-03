import styled from '@emotion/styled';
import MuiAppBar from '@mui/material/AppBar';
import { Box, Toolbar, Typography, Theme, CSSObject } from '@mui/material';

import { Colors } from '../../constants/Colors';
import { Search } from '../Search';
import { drawerWidth } from '../../constants/Viewports';
import { DrawerWrapperProps } from './DesktopDrawer';
import { useLocation } from 'react-router-dom';

type DesktopAppBarProps = {
  openDrawer: boolean;
  openSearch: boolean;
  openFilter: boolean;
  toggleSearch: any;
  toggleFilter: any;
};

export const DesktopAppBar = ({
  openDrawer,
  openSearch,
  openFilter,
  toggleSearch,
  toggleFilter,
}: DesktopAppBarProps) => {
  const MainAppBar = () => {
    const location = useLocation();
    const pageName = location.pathname.split('/').length ? location.pathname.split('/')[1] : 'Ratatieto';
    return (
      <>
        <Typography variant="subtitle2" textTransform="capitalize">
          {pageName || 'Etusivu'}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <ToolbarWrapper>
          <Search
            openSearch={openSearch}
            toggleSearch={toggleSearch}
            openFilter={openFilter}
            toggleFilter={toggleFilter}
            isDesktop={true}
          />
        </ToolbarWrapper>
      </>
    );
  };

  return (
    <DesktopAppBarWrapper color="transparent" open={openDrawer}>
      <Toolbar>
        <MainAppBar />
      </Toolbar>
    </DesktopAppBarWrapper>
  );
};

const openedMixin = (theme: Theme): CSSObject => ({
  paddingLeft: `${drawerWidth + 40}px`,
  transition: theme.transitions.create('padding', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

// Default closed drawer's width is 65px
const closedMixin = (theme: Theme): CSSObject => ({
  paddingLeft: `${65 + 40}px`,
  transition: theme.transitions.create('padding', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
});

export const DesktopAppBarWrapper = styled(MuiAppBar)<DrawerWrapperProps>(({ theme, open }) => {
  return {
    boxShadow: 'none',
    backgroundColor: Colors.white,
    // TODO: Title bar's left margin/padding is still incorrect
    [theme.breakpoints.only('mobile')]: {
      position: 'relative',
      marginTop: '70px',
    },
    [theme.breakpoints.only('tablet')]: {
      position: 'relative',
      marginTop: '70px',
      marginLeft: '20px',
    },
    [theme.breakpoints.up('desktop')]: {
      position: 'absolute',
      paddingTop: '40px',
      paddingRight: '40px',
      ...((open && {
        ...openedMixin(theme),
      }) as any),
      ...((!open && {
        ...closedMixin(theme),
      }) as any),
      overflow: 'visible',
    },
  };
});

const ToolbarWrapper = styled(Toolbar)(({ theme }) => ({
  [theme.breakpoints.down('desktop')]: {
    display: 'none',
  },
  [theme.breakpoints.up('desktop')]: {
    borderRadius: '4px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: Colors.extrablack,
  },
}));
