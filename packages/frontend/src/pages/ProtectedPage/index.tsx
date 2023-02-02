import React from 'react';

import { ContentWrapper, ContainerWrapper } from './index.styles';
import { NavBar } from '../../components/NavBar';
import { AppContextProvider } from '../../contexts/AppContextProvider';
import { Footer } from '../../components/Footer';

type Props = {
  children: React.ReactElement;
  pageTitle?: string;
};

// Protected routes will be wrapped around by ProtectedPage
// to get access navigation bar and title bar
export const ProtectedPage = ({ children, pageTitle }: Props) => {
  return (
    <ContainerWrapper>
      <AppContextProvider>
        <NavBar pageTitle={pageTitle} />
        <ContentWrapper>
          {children}
          <Footer />
        </ContentWrapper>
      </AppContextProvider>
    </ContainerWrapper>
  );
};
