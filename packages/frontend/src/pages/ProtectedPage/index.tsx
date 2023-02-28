import React, { useContext } from 'react';

import { ContentWrapper, ContainerWrapper } from './index.styles';
import { NavBar } from '../../components/NavBar';
import { Footer } from '../../components/Footer';
import { NotificationTypes } from '../../components/Editor/NotificationTypes';
import { AppBarContext } from '../../contexts/AppBarContext';

type Props = {
  children: React.ReactElement;
};

// Protected routes will be wrapped around by ProtectedPage
// to get access navigation bar and title bar
export const ProtectedPage = ({ children }: Props) => {
  const { openEdit, openToolbar } = useContext(AppBarContext);

  return (
    <ContainerWrapper>
      <NavBar />
      <ContentWrapper openEdit={openEdit} openToolbar={openToolbar}>
        {openEdit && <NotificationTypes />}
        {children}
        <Footer />
      </ContentWrapper>
    </ContainerWrapper>
  );
};
