import { Box } from '@mui/material';
import { useState } from 'react';
import { MiniAppBar } from './MiniAppBar';
import { DesktopDrawer } from './DesktopDrawer';
import { MiniDrawer } from './MiniDrawer';

export const NavBar = () => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => setOpen(!open);

  return (
    <Box>
      <MiniAppBar open={open} toggleDrawer={toggleDrawer} />
      <MiniDrawer open={open} toggleDrawer={toggleDrawer} />
      <DesktopDrawer open={open} toggleDrawer={toggleDrawer} />
    </Box>
  );
};
