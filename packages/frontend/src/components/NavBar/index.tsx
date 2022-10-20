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
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import RataExtLogo from '../../assets/images/Logo_noText.png';
import {
  MiniAppBarWrapper,
  // AppBarWrapper,
  DrawerWrapper,
} from './index.styles';
import { useState } from 'react';
import { IMenuItem, MenuItemList } from './MenuItemList';
import { isDesktopScreen } from '../../utils/helpers';

export const NavBar = () => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => setOpen(!open);

  const navigate = useNavigate();

  return (
    <Box>
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
      <DrawerWrapper variant={isDesktopScreen ? 'permanent' : 'persistent'} anchor="left" open={open}>
        {isDesktopScreen ? (
          <>
            <Toolbar>
              <Typography component="img" src={RataExtLogo} alt="Logo" sx={{ width: '65px', height: '65px' }} />
              <Typography sx={{ fontSize: '18px', opacity: open ? 1 : 0 }}>Ratatiedon extranet</Typography>
            </Toolbar>
            <ListItem key={open ? 'Close drawer' : 'Open drawer'} disablePadding onClick={toggleDrawer}>
              <ListItemButton>
                <ListItemIcon>{open ? <ArrowBackIcon color="primary" /> : <MenuIcon color="primary" />}</ListItemIcon>
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <Toolbar />
        )}
        <List>
          {MenuItemList.map((item: IMenuItem) => {
            const { key, primary, icon, to } = item;
            return (
              <ListItem key={key} disablePadding onClick={() => navigate(to)}>
                <ListItemButton>
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText primary={primary} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </DrawerWrapper>
    </Box>
  );
};
