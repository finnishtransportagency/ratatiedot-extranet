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
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useLocation, useNavigate } from 'react-router-dom';

import RataExtLogo from '../../assets/images/Logo_noText.png';
import {
  MobileAppBarWrapper,
  AppBarWrapper,
  DrawerWrapper,
  LogoImageWrapper,
  LogoTextWrapper,
  DrawerHeader,
} from './index.styles';
import { useState } from 'react';
import { Routes } from '../../constants/Routes';
import { IMenuItem, MenuItemList } from './MenuItemList';

export const NavBar = () => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => setOpen(!open);

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

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
      <AppBarWrapper position="fixed" color="transparent" open={open}>
        <Toolbar>
          <Typography variant="subtitle2">Ohjeet</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton size="large" edge="end" color="inherit" area-label="open search">
            <SearchIcon color="primary" />
          </IconButton>
          {/* Temporary open drawer for desktop view */}
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
      </AppBarWrapper>
      <DrawerWrapper variant="persistent" anchor="left" open={open}>
        <Toolbar />
        <List>
          {MenuItemList.map((item: IMenuItem) => {
            const { key, primary, icon, to } = item;
            return (
              <ListItem key={key} disablePadding onClick={() => navigate(to)}>
                <ListItemButton>
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText primary={primary} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </DrawerWrapper>
    </Box>
  );
};
