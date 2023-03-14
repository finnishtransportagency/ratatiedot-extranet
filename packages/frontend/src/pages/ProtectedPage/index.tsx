import React, { useContext } from 'react';

import { ContentWrapper, ContainerWrapper } from './index.styles';
import { NavBar } from '../../components/NavBar';
import { Footer } from '../../components/Footer';
import { AppBarContext } from '../../contexts/AppBarContext';
import { SlateInputField } from '../../components/Editor/SlateInputField';
import { EditorContext } from '../../contexts/EditorContext';
import { isSlateValueEmpty } from '../../utils/slateEditorUtil';
import { FileUploadDialogButton } from '../../components/Files/FileUploadDialogButton';
import { matchRoutes, useLocation } from 'react-router-dom';
import { routes } from '../../routes';

type Props = {
  children: React.ReactElement;
};

// Protected routes will be wrapped around by ProtectedPage
// to get access navigation bar and title bar
export const ProtectedPage = ({ children }: Props) => {
  const { openEdit, openToolbar } = useContext(AppBarContext);
  const { value } = useContext(EditorContext);
  const location = useLocation();

  const getRouteName = () => {
    const routeMatch = matchRoutes(routes, location);
    if (routeMatch) {
      const path = routeMatch[0].route.path as string;
      return path.split('/').pop() as string;
    }
    return '';
  };

  const isEditorOpened =
    openToolbar || (openEdit && !isSlateValueEmpty(JSON.parse(value))) || !isSlateValueEmpty(JSON.parse(value));

  return (
    <ContainerWrapper>
      <NavBar />
      <ContentWrapper openedit={openEdit} opentoolbar={openToolbar}>
        {isEditorOpened && <SlateInputField />}
        {isEditorOpened && <FileUploadDialogButton categoryName={getRouteName()} />}
        {children}
        <Footer />
      </ContentWrapper>
    </ContainerWrapper>
  );
};
