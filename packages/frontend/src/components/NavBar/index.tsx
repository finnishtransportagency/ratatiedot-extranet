import { Box } from '@mui/material';
import { MiniAppBar } from './MiniAppBar';
import { DesktopDrawer } from './DesktopDrawer';
import { MiniDrawer } from './MiniDrawer';
import { DesktopAppBar } from './DesktopAppBar';

type NavBarProps = {
  pageTitle?: string;
};

export const NavBar = ({ pageTitle }: NavBarProps) => {
  return (
    <Box>
      <MiniAppBar />
      <MiniDrawer />
      <DesktopAppBar pageTitle={pageTitle} />
      <DesktopDrawer />
    </Box>
  );
};
