import styled from '@emotion/styled';
import { Toolbar } from '@mui/material';
import MuiDrawer, { DrawerProps } from '@mui/material/Drawer';

import { Colors } from '../../constants/Colors';
import { drawerWidth } from '../../constants/Viewports';
import { MenuList } from './MenuList';

type MiniDrawerProps = {
  open: boolean;
  toggleDrawer: React.MouseEventHandler<HTMLElement>;
};

export const MiniDrawer = ({ open }: MiniDrawerProps) => {
  return (
    <MiniDrawerWrapper variant="persistent" anchor="left" open={open}>
      <Toolbar />
      <MenuList open={open} />
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
      position: 'fixed',
      bottom: '16px',
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
