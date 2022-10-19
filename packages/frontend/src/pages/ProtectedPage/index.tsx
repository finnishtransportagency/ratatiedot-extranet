import React from 'react';
import { Toolbar } from '@mui/material';

import { ProtectedContainerWrapper } from './index.styles';
import { NavBar } from '../../components/NavBar';

type Props = {
  children: React.ReactElement;
};

export const ProtectedPage = ({ children }: Props) => {
  // To-do: Authentication check goes here
  // if unauthenticated --> logout
  // if authenticated --> go to first login / landing page
  return (
    <ProtectedContainerWrapper>
      <NavBar />
      <Toolbar />
      {children}
    </ProtectedContainerWrapper>
  );
};
