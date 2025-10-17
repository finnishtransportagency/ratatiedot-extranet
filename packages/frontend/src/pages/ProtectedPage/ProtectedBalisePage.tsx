import React from 'react';
import { Box } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { MiniDrawer } from '../../components/NavBar/MiniDrawer';
import { DesktopDrawer } from '../../components/NavBar/DesktopDrawer';

type Props = {
  children: React.ReactElement;
};

// Special layout for Balise page that only includes drawers but no app bars
// This maximizes the viewport space for the table
export const ProtectedBalisePage = ({ children }: Props) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
      }}
    >
      {/* Only include the side navigation drawers */}
      <MiniDrawer />
      <DesktopDrawer />

      {/* Main content area without any app bars */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          height: '100vh',
          margin: '0px 8px',
          padding: { xs: '2px', sm: '4px', md: '6px' }, // Small padding for breathing room
          overflow: 'hidden', // Prevent double scrollbars
        }}
      >
        {children}

        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </Box>
    </Box>
  );
};
