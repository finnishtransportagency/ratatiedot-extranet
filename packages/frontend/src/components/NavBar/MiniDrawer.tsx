import styled from '@emotion/styled';
import { Toolbar } from '@mui/material';
import MuiDrawer, { DrawerProps } from '@mui/material/Drawer';
import { useContext } from 'react';

import { Colors } from '../../constants/Colors';
import { drawerWidth } from '../../constants/Viewports';
import { AppBarContext } from '../../contexts/AppBarContext';
import { MenuList } from './MenuList';

export const MiniDrawer = () => {
  const { openMiniDrawer } = useContext(AppBarContext);
  return (
    <MiniDrawerWrapper variant="persistent" anchor="left" open={openMiniDrawer}>
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
  };
});
