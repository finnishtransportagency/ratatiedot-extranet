import React, { useContext } from 'react';

import { ContentWrapper, ContainerWrapper } from './index.styles';
import { NavBar } from '../../components/NavBar';
import { Footer } from '../../components/Footer';
import { AppBarContext } from '../../contexts/AppBarContext';
import { SlateInputField } from '../../components/Editor/SlateInputField';
import { EditorContext } from '../../contexts/EditorContext';
import { isSlateValueEmpty } from '../../utils/slateEditorUtil';
import { FileUploadDialogButton } from '../../components/Files/FileUploadDialogButton';
import { useLocation } from 'react-router-dom';
import { CategoryFiles } from '../../components/Files/CategoryFiles';
import { getCategoryRouteName } from '../../routes';
import { DesktopAppBar } from '../../components/NavBar/DesktopAppBar';
import { Box } from '@mui/material';
import { Folders } from '../../components/FolderList/Folders';

type Props = {
  children: React.ReactElement;
};

// Protected routes will be wrapped around by ProtectedPage
// to get access navigation bar and title bar
export const ProtectedPage = ({ children }: Props) => {
  const { openEdit, openToolbar } = useContext(AppBarContext);
  const { value } = useContext(EditorContext);
  const location = useLocation();
  const categoryRouteName = getCategoryRouteName(location);

  const isEditorOpened = openToolbar || (openEdit && !isSlateValueEmpty(value)) || !isSlateValueEmpty(value);

  return (
    <ContainerWrapper>
      <NavBar />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <DesktopAppBar />
        <ContentWrapper openedit={openEdit} opentoolbar={openToolbar}>
          {isEditorOpened && <FileUploadDialogButton categoryName={categoryRouteName} />}
          <Folders />
          {children}
          {isEditorOpened && <SlateInputField />}
          {categoryRouteName && <CategoryFiles />}
        </ContentWrapper>
        <Footer />
      </Box>
    </ContainerWrapper>
  );
};
