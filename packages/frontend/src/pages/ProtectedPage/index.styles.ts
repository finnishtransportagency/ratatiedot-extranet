import styled from '@emotion/styled';
import { Box, CSSObject, Theme } from '@mui/material';
import { DrawerWrapperProps } from '../../components/NavBar/DesktopDrawer';

export const ContainerWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('desktop')]: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: '100vh',
  },
  [theme.breakpoints.up('desktop')]: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: '100vh',
    '& .MuiToolbar-root': {
      padding: 0,
    },
  },
}));

const openedEditContentMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  marginTop: '250px',
});

const closedContentMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  marginTop: '90px',
});

const openedToolbarContentMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  marginTop: '180px',
});

export const ContentWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'openedit' && prop !== 'opentoolbar',
})<DrawerWrapperProps>(({ theme, openedit, opentoolbar }) => {
  return {
    [theme.breakpoints.up('desktop')]: {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      ...((openedit && { ...openedEditContentMixin(theme) }) as any),
      ...((!openedit && { ...closedContentMixin(theme) }) as any),
      ...((opentoolbar && { ...openedToolbarContentMixin(theme) }) as any),
    },
  };
});
