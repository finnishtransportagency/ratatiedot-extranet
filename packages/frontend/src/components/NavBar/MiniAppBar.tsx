import styled from '@emotion/styled';
import MuiAppBar, { AppBarProps } from '@mui/material/AppBar';
import { Box, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

import RataExtLogo from '../../assets/images/Logo_noText.png';

import { Colors } from '../../constants/Colors';
import { Search } from '../Search';
import { useContext } from 'react';
import { AppBarContext } from '../../contexts/AppBarContext';
import { Link } from 'react-router-dom';
import { Routes } from '../../constants/Routes';

export const MiniAppBar = () => {
  const { openDrawer, toggleDrawer, openSearch, toggleSearch } = useContext(AppBarContext);
  const MainAppBar = () => {
    return (
      <>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          area-label={openDrawer ? 'close drawer' : 'open drawer'}
          onClick={toggleDrawer}
        >
          {openDrawer ? <CloseIcon color="primary" /> : <MenuIcon color="primary" />}
        </IconButton>
        <Link to={Routes.HOME} style={{ textDecoration: 'none', boxShadow: 'none', color: Colors.extrablack }}>
          <Toolbar sx={{ padding: 0 }}>
            <Typography sx={{ width: '40px', height: '40px' }} component="img" src={RataExtLogo} alt="Logo" />
            <Typography sx={{ fontSize: '18px' }}>RATATIETO</Typography>
          </Toolbar>
        </Link>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton size="large" edge="end" color="inherit" area-label="open search" onClick={toggleSearch}>
          <SearchIcon color="primary" />
        </IconButton>
      </>
    );
  };

  return (
    <MiniAppBarWrapper position="fixed" color="transparent" open={openDrawer}>
      <Toolbar>{openSearch ? <Search /> : <MainAppBar />}</Toolbar>
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
