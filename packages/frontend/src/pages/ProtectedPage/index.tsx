import React from 'react';

import { ContentWrapper, ContainerWrapper } from './index.styles';
import { NavBar } from '../../components/NavBar';
import { AppContextProvider } from '../../contexts/AppContextProvider';
import { Footer } from '../../components/Footer';

type Props = {
  children: React.ReactElement;
};

// Protected routes will be wrapped around by ProtectedPage
// to get access navigation bar and title bar
export const ProtectedPage = ({ children }: Props) => {
  return (
    <ContainerWrapper>
      <AppContextProvider>
        <NavBar />
        <ContentWrapper>
          {children}
          <Footer />
        </ContentWrapper>
      </AppContextProvider>
    </ContainerWrapper>
  );
};
