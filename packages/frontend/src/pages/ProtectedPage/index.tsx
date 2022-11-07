import React from 'react';
import { Toolbar } from '@mui/material';

import { ProtectedContainerWrapper } from './index.styles';
import { NavBar } from '../../components/NavBar';
import { AppContextProvider } from '../../contexts/AppContextProvider';

type Props = {
  children: React.ReactElement;
};

// Protected routes will be wrapped around by ProtectedPage
// to get access navigation bar and title bar
export const ProtectedPage = ({ children }: Props) => {
  // To-do: Authentication will be handled in routes.tsx (e.g. loader function)
  return (
    <ProtectedContainerWrapper>
      <AppContextProvider>
        <NavBar />
        <Toolbar />
        {children}
      </AppContextProvider>
    </ProtectedContainerWrapper>
  );
};
