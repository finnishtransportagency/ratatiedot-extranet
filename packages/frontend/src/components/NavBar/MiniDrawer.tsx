import styled from '@emotion/styled';
import { Toolbar } from '@mui/material';
import MuiDrawer, { DrawerProps } from '@mui/material/Drawer';
import { useContext } from 'react';

import { Colors } from '../../constants/Colors';
import { drawerWidth } from '../../constants/Viewports';
import { AppBarContext } from '../../contexts/AppBarContext';
import { MenuList } from './MenuList';

export const MiniDrawer = () => {
  const { openDrawer } = useContext(AppBarContext);
  return (
    <MiniDrawerWrapper variant="persistent" anchor="left" open={openDrawer}>
      <Toolbar />
      <MenuList />
    </MiniDrawerWrapper>
  );
};

interface DrawerWrapperProps extends DrawerProps {
  open?: boolean;
}

export const MiniDrawerWrapper = styled(MuiDrawer)<DrawerWrapperProps>(({ theme, open }) => {
  return {
    [theme.breakpoints.down('tablet')]: {
      '& .MuiPaper-root': {
        width: '100%',
      },
    },
    [theme.breakpoints.up('tablet')]: {
      '& .MuiPaper-root': {
        width: `${drawerWidth}px`,
        borderColor: Colors.lightblue,
        borderWidth: '3px',
      },
    },
    [theme.breakpoints.up('desktop')]: {
      display: 'none',
    },
    // Logout is the last list item
    '& li:last-child': {
      // TODO: Logout should always be placed in bottom
      // position: 'fixed',
      // bottom: '16px',
      width: open ? `${drawerWidth}px` : `calc(${theme.spacing(8)} + 1px)`,
      '& .MuiListItemIcon-root': {
        color: Colors.darkblue,
      },
      '& .MuiListItemText-root': {
        color: Colors.darkblue,
      },
    },
  };
});
