import { Toolbar } from '@mui/material';
import React from 'react';
import { NavBar } from '../../components/NavBar';

type Props = {
  children: React.ReactElement;
};

export const ProtectedPage = ({ children }: Props) => {
  // To-do: Authentication check goes here
  // if unauthenticated --> logout
  // if authenticated --> go to first login / landing page
  return (
    <React.Fragment>
      <NavBar />
      <Toolbar />
      {children}
    </React.Fragment>
  );
};
