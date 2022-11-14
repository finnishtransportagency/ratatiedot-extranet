import { Box } from '@mui/material';
import { useState } from 'react';
import { MiniAppBar } from './MiniAppBar';
import { DesktopDrawer } from './DesktopDrawer';
import { MiniDrawer } from './MiniDrawer';
import { DesktopAppBar } from './DesktopAppBar';

export const NavBar = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);

  const toggleDrawer = () => setOpenDrawer(!openDrawer);
  const toggleSearch = () => setOpenSearch(!openSearch);

  return (
    <Box>
      <MiniAppBar
        openDrawer={openDrawer}
        toggleDrawer={toggleDrawer}
        openSearch={openSearch}
        toggleSearch={toggleSearch}
      />
      <MiniDrawer openDrawer={openDrawer} toggleDrawer={toggleDrawer} />
      <DesktopAppBar
        openDrawer={openDrawer}
        toggleDrawer={toggleDrawer}
        openSearch={openSearch}
        toggleSearch={toggleSearch}
      />
      <DesktopDrawer openDrawer={openDrawer} toggleDrawer={toggleDrawer} />
    </Box>
  );
};
