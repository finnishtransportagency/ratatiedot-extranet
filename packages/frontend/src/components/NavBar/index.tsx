import { Box } from '@mui/material';
import { MiniAppBar } from './MiniAppBar';
import { DesktopDrawer } from './DesktopDrawer';
import { MiniDrawer } from './MiniDrawer';
import { DesktopAppBar } from './DesktopAppBar';

export const NavBar = () => {
  return (
    <Box>
      <MiniAppBar />
      <MiniDrawer />
      <DesktopAppBar />
      <DesktopDrawer />
    </Box>
  );
};
