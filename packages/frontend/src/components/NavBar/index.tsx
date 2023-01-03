import { Box } from '@mui/material';
import { useState } from 'react';
import { MiniAppBar } from './MiniAppBar';
import { DesktopDrawer } from './DesktopDrawer';
import { MiniDrawer } from './MiniDrawer';
import { DesktopAppBar } from './DesktopAppBar';

export const NavBar = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  const toggleDrawer = () => setOpenDrawer(!openDrawer);
  const toggleSearch = () => {
    setOpenDrawer(false);
    setOpenSearch(!openSearch);
  };
  const toggleFilter = () => {
    setOpenDrawer(false);
    setOpenFilter(!openFilter);
  };

  return (
    <Box>
      <MiniAppBar
        openDrawer={openDrawer}
        toggleDrawer={toggleDrawer}
        openSearch={openSearch}
        toggleSearch={toggleSearch}
        openFilter={openFilter}
        toggleFilter={toggleFilter}
      />
      <MiniDrawer openDrawer={openDrawer} toggleDrawer={toggleDrawer} />
      <DesktopAppBar
        openDrawer={openDrawer}
        openSearch={openSearch}
        toggleSearch={toggleSearch}
        openFilter={openFilter}
        toggleFilter={toggleFilter}
      />
      <DesktopDrawer openDrawer={openDrawer} toggleDrawer={toggleDrawer} />
    </Box>
  );
};
