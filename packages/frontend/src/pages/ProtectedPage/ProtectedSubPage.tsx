import React, { useContext } from 'react';
import { Box } from '@mui/material';

import { ContentWrapper, ContainerWrapper } from './index.styles';
import { NavBar } from '../../components/NavBar';
import { Footer } from '../../components/Footer';
import { AppBarContext } from '../../contexts/AppBarContext';
import { useLocation, useParams } from 'react-router-dom';
import { CategoryFiles } from '../../components/Files/CategoryFiles';
import { getCategoryRouteName } from '../../routes';
import { DesktopAppBar } from '../../components/NavBar/DesktopAppBar';

type Props = {
  children: React.ReactElement;
};

// Protected sub-routes will be wrapped around by ProtectedSubPage
// to get access navigation bar, title bar and sub-category files
// no editing and favorite features
export const ProtectedSubPage = ({ children }: Props) => {
  const { openEdit, openToolbar } = useContext(AppBarContext);
  const location = useLocation();
  const categoryRouteName = getCategoryRouteName(location);
  const { area } = useParams<{ area: string }>();

  return (
    <ContainerWrapper>
      <NavBar />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <DesktopAppBar />
        <ContentWrapper openedit={openEdit} opentoolbar={openToolbar}>
          {children}
          {categoryRouteName && <CategoryFiles childFolderName={area} />}
        </ContentWrapper>
        <Footer />
      </Box>
    </ContainerWrapper>
  );
};
