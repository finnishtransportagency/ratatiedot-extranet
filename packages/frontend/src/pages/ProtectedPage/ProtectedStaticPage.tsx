import React, { useContext } from 'react';
import { Box } from '@mui/material';

import { ContentWrapper, ContainerWrapper } from './index.styles';
import { NavBar } from '../../components/NavBar';
import { Footer } from '../../components/Footer';
import { AppBarContext } from '../../contexts/AppBarContext';
import { DesktopAppBar } from '../../components/NavBar/DesktopAppBar';

type Props = {
  children: React.ReactElement;
};

// Protected static pages will be wrapped around by ProtectedStaticPage
// to get access navigation bar, title bar but no file lists,
// no editing and favorite features
export const ProtectedStaticPage = ({ children }: Props) => {
  const { openEdit, openToolbar } = useContext(AppBarContext);

  return (
    <ContainerWrapper>
      <NavBar />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <DesktopAppBar />
        <ContentWrapper openedit={openEdit} opentoolbar={openToolbar}>
          {children}
        </ContentWrapper>
        <Footer />
      </Box>
    </ContainerWrapper>
  );
};
