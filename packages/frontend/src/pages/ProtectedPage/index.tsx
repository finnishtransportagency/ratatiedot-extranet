import React, { useContext } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Alert, Box, Button } from '@mui/material';
import { useLocation } from 'react-router-dom';

import { ContentWrapper, ContainerWrapper } from './index.styles';
import { NavBar } from '../../components/NavBar';
import { Footer } from '../../components/Footer';
import { AppBarContext } from '../../contexts/AppBarContext';
import { SlateInputField } from '../../components/Editor/SlateInputField';
import { EditorContext } from '../../contexts/EditorContext';
import { isSlateValueEmpty } from '../../utils/slateEditorUtil';
import { CategoryFiles } from '../../components/Files/CategoryFiles';
import { getCategoryRouteName } from '../../routes';
import { useTranslation } from 'react-i18next';
import { IMenuItem, MenuContext } from '../../contexts/MenuContext';
import { DesktopAppBar } from '../../components/NavBar/DesktopAppBar';
import { PageTitle } from '../../components/Typography/PageTitle';
import { ProtectedContainerWrapper } from '../../styles/common';
import { CategoryDataContext } from '../../contexts/CategoryDataContext';

type Props = {
  children: React.ReactElement;
};

// Protected routes will be wrapped around by ProtectedPage
// to get access navigation bar and title bar
export const ProtectedPage = ({ children }: Props) => {
  const { t } = useTranslation(['common']);
  const { openEdit, openToolbar } = useContext(AppBarContext);
  const { value } = useContext(EditorContext);
  const { favoriteCategories, addFavoriteHandler, removeFavoriteHandler } = useContext(MenuContext);
  const { hasConfidentialContent } = useContext(CategoryDataContext);
  const location = useLocation();
  const categoryRouteName = getCategoryRouteName(location);

  const isEditorOpened = openToolbar || (openEdit && !isSlateValueEmpty(value)) || !isSlateValueEmpty(value);

  const isFavorite = favoriteCategories.some((c: IMenuItem) => {
    return c.to?.indexOf(categoryRouteName) !== -1;
  });

  const AddFavoriteButton = () => {
    return (
      <ProtectedContainerWrapper>
        <Button sx={{ textTransform: 'none', padding: 0 }} onClick={() => addFavoriteHandler(categoryRouteName)}>
          <AddCircleOutlineIcon fontSize="small" />
          {t('common:action.add_favorite')}
        </Button>
      </ProtectedContainerWrapper>
    );
  };

  const RemoveFavoriteButton = () => {
    return (
      <ProtectedContainerWrapper>
        <Button sx={{ textTransform: 'none', padding: 0 }} onClick={() => removeFavoriteHandler(categoryRouteName)}>
          <RemoveCircleOutlineIcon fontSize="small" />
          {t('common:action.remove_favorite')}
        </Button>
      </ProtectedContainerWrapper>
    );
  };

  return (
    <ContainerWrapper>
      <NavBar />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <DesktopAppBar />
        <ContentWrapper openedit={openEdit} opentoolbar={openToolbar}>
          <PageTitle routerName={categoryRouteName} />
          {hasConfidentialContent && (
            <ProtectedContainerWrapper>
              <Alert severity="warning">
                {t('common:warning.confidential')}
                {/* TODO: add a link to data handling instructions when available*/}
                {/* <Link href="https://example.fi/" target="_blank" rel="noopener noreferrer"></Link> */}
              </Alert>
            </ProtectedContainerWrapper>
          )}
          {categoryRouteName ? isFavorite ? <RemoveFavoriteButton /> : <AddFavoriteButton /> : <></>}
          {isEditorOpened && <SlateInputField />}
          {children}
          {categoryRouteName && <CategoryFiles />}
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={true}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </ContentWrapper>
        <Footer />
      </Box>
    </ContainerWrapper>
  );
};
