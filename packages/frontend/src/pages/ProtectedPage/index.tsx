import React, { useContext } from 'react';

import { ContentWrapper, ContainerWrapper } from './index.styles';
import { NavBar } from '../../components/NavBar';
import { Footer } from '../../components/Footer';
import { NotificationTypes } from '../../components/Editor/NotificationTypes';
import { AppBarContext } from '../../contexts/AppBarContext';
import { SlateInputField } from '../../components/Editor/SlateInputField';
import { EditorContext } from '../../contexts/EditorContext';
import { isSlateValueEmpty } from '../../utils/slateEditorUtil';

type Props = {
  children: React.ReactElement;
};

// Protected routes will be wrapped around by ProtectedPage
// to get access navigation bar and title bar
export const ProtectedPage = ({ children }: Props) => {
  const { openEdit, openToolbar } = useContext(AppBarContext);
  const { value } = useContext(EditorContext);

  const isEditorOpened =
    openToolbar || openEdit || !isSlateValueEmpty(JSON.parse(value));

  return (
    <ContainerWrapper>
      <NavBar />
      <ContentWrapper openedit={openEdit} opentoolbar={openToolbar}>
        {isEditorOpened && <SlateInputField />}
        {children}
        <Footer />
      </ContentWrapper>
    </ContainerWrapper>
  );
};
