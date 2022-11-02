import styled from '@emotion/styled';
import MuiAppBar, { AppBarProps } from '@mui/material/AppBar';
import { Box, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

import RataExtLogo from '../../assets/images/Logo_noText.png';

import { Colors } from '../../constants/Colors';

type MiniAppBarProps = {
  open: boolean;
  toggleDrawer: React.MouseEventHandler<HTMLElement>;
};

export const MiniAppBar = ({ open, toggleDrawer }: MiniAppBarProps) => {
  return (
    <MiniAppBarWrapper position="fixed" color="transparent" open={open}>
      <Toolbar>
        <Typography sx={{ width: '40px', height: '40px' }} component="img" src={RataExtLogo} alt="Logo" />
        <Typography sx={{ fontSize: '18px' }}>Ratatiedon extranet</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton size="large" edge="end" color="inherit" area-label="open search">
          <SearchIcon color="primary" />
        </IconButton>
        <IconButton
          size="large"
          edge="end"
          color="inherit"
          area-label={open ? 'close drawer' : 'open drawer'}
          onClick={toggleDrawer}
        >
          {open ? <CloseIcon color="primary" /> : <MenuIcon color="primary" />}
        </IconButton>
      </Toolbar>
    </MiniAppBarWrapper>
  );
};

interface AppBarWrapperProps extends AppBarProps {
  open?: boolean;
}

const drawerWidth = 306;

export const MiniAppBarWrapper = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarWrapperProps>(({ theme, open }) => {
  return {
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: Colors.white,
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
