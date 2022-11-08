import { Box } from '@mui/material';
import { useState } from 'react';
import { MiniAppBar } from './MiniAppBar';
import { DesktopDrawer } from './DesktopDrawer';
import { MiniDrawer } from './MiniDrawer';

export const NavBar = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);

  const toggleDrawer = () => setOpenDrawer(!openDrawer);
  const toggleSearch = () => setOpenSearch(!openSearch);

  // Only MiniAppBar (mobile/tablet screen) needs openSearch & toggleSearch
  return (
    <Box>
      <MiniAppBar
        openDrawer={openDrawer}
        toggleDrawer={toggleDrawer}
        openSearch={openSearch}
        toggleSearch={toggleSearch}
      />
      <MiniDrawer openDrawer={openDrawer} toggleDrawer={toggleDrawer} />
      <DesktopDrawer openDrawer={openDrawer} toggleDrawer={toggleDrawer} />
    </Box>
  );
};
