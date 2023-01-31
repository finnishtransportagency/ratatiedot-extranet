import React from 'react';

import { ContentWrapper, ProtectedContainerWrapper } from './index.styles';
import { NavBar } from '../../components/NavBar';
import { AppContextProvider } from '../../contexts/AppContextProvider';

type Props = {
  children: React.ReactElement;
  pageTitle?: string;
};

// Protected routes will be wrapped around by ProtectedPage
// to get access navigation bar and title bar
export const ProtectedPage = ({ children, pageTitle }: Props) => {
  // TODO: Authentication will be handled in routes.tsx (e.g. loader function)
  return (
    <ProtectedContainerWrapper>
      <AppContextProvider>
        <NavBar pageTitle={pageTitle} />
        <ContentWrapper>{children}</ContentWrapper>
      </AppContextProvider>
    </ProtectedContainerWrapper>
  );
};
