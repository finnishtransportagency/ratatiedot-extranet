import React, { useContext } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Box, Checkbox, FormControlLabel, Grid, ListItem, Paper, styled } from '@mui/material';
import { useLocation } from 'react-router-dom';

import { ContentWrapper, ContainerWrapper } from './index.styles';
import { NavBar } from '../../components/NavBar';
import { Footer } from '../../components/Footer';
import { AppBarContext } from '../../contexts/AppBarContext';
import { SlateInputField } from '../../components/Editor/SlateInputField';
import { EditorContext } from '../../contexts/EditorContext';
import { isSlateValueEmpty } from '../../utils/slateEditorUtil';
import { useTranslation } from 'react-i18next';
import { DesktopAppBar } from '../../components/NavBar/DesktopAppBar';
import { PageTitle } from '../../components/Typography/PageTitle';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fi } from 'date-fns/locale';
import { Routes } from '../../constants/Routes';

type Props = {
  children: React.ReactElement;
};

// Protected routes will be wrapped around by ProtectedPage
// to get access navigation bar and title bar
export const ProtectedNoticePage = ({ children }: Props) => {
  const { t } = useTranslation(['common']);
  const { openEdit, openToolbar } = useContext(AppBarContext);
  const { value, noticeFields, noticeFieldsHandler } = useContext(EditorContext);
  const location = useLocation();

  const handleStartDateChange = (newValue: Date | null) => {
    if (newValue) {
      noticeFieldsHandler({ ...noticeFields, publishTimeStart: newValue });
    }
  };

  const handleEndDateChange = (newValue: Date | null) => {
    if (newValue) {
      noticeFieldsHandler({ ...noticeFields, publishTimeEnd: newValue });
    }
  };

  const handleIsBannerChange = (event: any) => {
    const { checked } = event.target;
    noticeFieldsHandler({ ...noticeFields, showAsBanner: checked });
  };

  const isEditorOpened = openToolbar || (openEdit && !isSlateValueEmpty(value)) || !isSlateValueEmpty(value);
  const pageTitle = location.pathname === Routes.NEW_NOTICE ? t('common:noticeList.createNewNotice') : '';

  return (
    <ContainerWrapper>
      <NavBar />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <DesktopAppBar />
        <ContentWrapper openedit={openEdit} opentoolbar={openToolbar}>
          {!openToolbar && <PageTitle routerName={pageTitle} />}
          {isEditorOpened && <SlateInputField />}
          {openToolbar && (
            <NoticeFieldsWrapper sx={{ margin: '0px 15px' }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fi}>
                <Grid container spacing={2}>
                  <Grid item>
                    <DateTimePicker
                      label={t('common:noticeList.publishTimeStart')}
                      value={new Date(noticeFields.publishTimeStart)}
                      onChange={(newValue) => handleStartDateChange(newValue)}
                    />
                  </Grid>
                  <Grid item>
                    <DateTimePicker
                      label={t('common:noticeList.publishTimeEnd')}
                      value={new Date(noticeFields.publishTimeEnd)}
                      onChange={(newValue) => handleEndDateChange(newValue)}
                    />
                  </Grid>
                </Grid>
                <ListItem disableGutters>
                  <FormControlLabel
                    control={
                      <Checkbox checked={noticeFields.showAsBanner} onChange={(value) => handleIsBannerChange(value)} />
                    }
                    label={t('common:noticeList.showAsBanner')}
                  />
                </ListItem>
              </LocalizationProvider>
            </NoticeFieldsWrapper>
          )}

          {children}
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

const NoticeFieldsWrapper = styled(Paper)(({ theme }) => ({
  boxShadow: 'none',
  [theme.breakpoints.only('mobile')]: {
    margin: '30px 15px',
  },
  [theme.breakpoints.only('tablet')]: {
    margin: '30px 32px',
  },
  [theme.breakpoints.only('desktop')]: {
    margin: '30px 40px 0px 40px',
  },
}));
