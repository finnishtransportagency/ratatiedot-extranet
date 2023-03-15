import React, { useContext } from 'react';

import { ContentWrapper, ContainerWrapper } from './index.styles';
import { NavBar } from '../../components/NavBar';
import { Footer } from '../../components/Footer';
import { AppBarContext } from '../../contexts/AppBarContext';
import { SlateInputField } from '../../components/Editor/SlateInputField';
import { EditorContext } from '../../contexts/EditorContext';
import { isSlateValueEmpty } from '../../utils/slateEditorUtil';
import { getRouteName } from '../../utils/helpers';
import { FileUploadDialogButton } from '../../components/Files/FileUploadDialogButton';
import { useLocation } from 'react-router-dom';

type Props = {
  children: React.ReactElement;
};

// Protected routes will be wrapped around by ProtectedPage
// to get access navigation bar and title bar
export const ProtectedPage = ({ children }: Props) => {
  const { openEdit, openToolbar } = useContext(AppBarContext);
  const { value } = useContext(EditorContext);
  const location = useLocation();

  const isEditorOpened = openToolbar || (openEdit && !isSlateValueEmpty(value)) || !isSlateValueEmpty(value);

  return (
    <ContainerWrapper>
      <NavBar />
      <ContentWrapper openedit={openEdit} opentoolbar={openToolbar}>
        {isEditorOpened && <SlateInputField />}
        {isEditorOpened && <FileUploadDialogButton categoryName={getRouteName(location)} />}
        {children}
        <Footer />
      </ContentWrapper>
    </ContainerWrapper>
  );
};
