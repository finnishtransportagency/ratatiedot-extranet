import {
  Box,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLocation, useNavigate } from 'react-router-dom';

import RataExtLogo from '../../assets/images/Logo_noText.png';
import {
  MobileAppBarWrapper,
  DesktopAppBarWrapper,
  DrawerWrapper,
  LogoImageWrapper,
  LogoTextWrapper,
} from './index.styles';
import { useState } from 'react';
import { Routes } from '../../constants/Routes';

export const NavBar = () => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => setOpen(!open);

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box>
      <MobileAppBarWrapper position="fixed" color="transparent" open={open}>
        <Toolbar>
          <LogoImageWrapper component="img" src={RataExtLogo} alt="Logo" />
          <LogoTextWrapper>Ratatiedon extranet</LogoTextWrapper>
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
      </MobileAppBarWrapper>
      <DesktopAppBarWrapper position="absolute" color="transparent" open={open}>
        <Toolbar />
        {/* <LogoImageWrapper component="img" src={RataExtLogo} alt="Logo" />
          <LogoTextWrapper>Ratatiedon extranet</LogoTextWrapper>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton size="large" edge="end" color="inherit" area-label="open search">
            <SearchIcon color="primary" />
          </IconButton> */}
      </DesktopAppBarWrapper>
      <DrawerWrapper variant="persistent" anchor="left" open={open}>
        <Toolbar />
        <List>
          <ListItem key="Close drawer" disablePadding onClick={toggleDrawer}>
            <ListItemButton>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                area-label={open ? 'close drawer' : 'open drawer'}
                onClick={toggleDrawer}
              >
                {open ? <ArrowBackIcon color="primary" /> : <MenuIcon color="primary" />}
              </IconButton>
            </ListItemButton>
          </ListItem>
          <ListItem key="Landing" disablePadding onClick={() => navigate(Routes.LANDING)}>
            <ListItemButton>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="Etusivu" />
            </ListItemButton>
          </ListItem>
          <ListItem key="Not found" disablePadding onClick={() => navigate(Routes.NOT_FOUND)}>
            <ListItemButton>
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              <ListItemText primary="Sivua ei löydy" />
            </ListItemButton>
          </ListItem>
          <ListItem
            key="Access denied"
            disablePadding
            onClick={() => navigate(Routes.ACCESS_DENIED, { state: { previousPath: location.pathname } })}
          >
            <ListItemButton>
              <ListItemIcon>
                <CheckCircleOutlineIcon />
              </ListItemIcon>
              <ListItemText primary="Pääsy kielletty" />
            </ListItemButton>
          </ListItem>
          <ListItem key="Log out" disablePadding onClick={() => navigate(Routes.HOME)}>
            <ListItemButton>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary={<Typography variant="subtitle2">Kirjaudu ulos</Typography>} />
            </ListItemButton>
          </ListItem>
        </List>
      </DrawerWrapper>
    </Box>
  );
};
