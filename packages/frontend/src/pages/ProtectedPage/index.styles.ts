import styled from '@emotion/styled';
import { Box, CSSObject, Theme } from '@mui/material';
import { DrawerWrapperProps } from '../../components/NavBar/DesktopDrawer';

export const ContainerWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('desktop')]: {
    display: 'block',
  },
  [theme.breakpoints.up('desktop')]: {
    display: 'flex',
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

export const ContentWrapper = styled(Box)<DrawerWrapperProps>(({ theme, openEdit, openToolbar }) => {
  return {
    width: '100%',
    [theme.breakpoints.up('desktop')]: {
      ...((openEdit && { ...openedEditContentMixin(theme) }) as any),
      ...((!openEdit && { ...closedContentMixin(theme) }) as any),
      ...((openToolbar && { ...openedToolbarContentMixin(theme) }) as any),
    },
  };
});
