import React, { useContext, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Box, Checkbox, FormControlLabel, Grid, ListItem, Paper, TextField, styled } from '@mui/material';
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
import { checkAdminRights } from '../../services/AdminRightService';

type Props = {
  children: React.ReactElement;
};

// Protected routes will be wrapped around by ProtectedPage
// to get access navigation bar and title bar
export const ProtectedNoticePage = ({ children }: Props) => {
  const { t } = useTranslation(['common']);
  const { openEdit, openToolbar, userRightHandler, userRight } = useContext(AppBarContext);
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

  const handleTitleChange = (newValue: string | null) => {
    noticeFieldsHandler({ ...noticeFields, title: newValue });
  };

  useEffect(() => {
    const checkUserRights = async () => {
      const { isAdmin } = await checkAdminRights();
      userRightHandler({ ...userRight, isAdmin: isAdmin });
    };
    checkUserRights();
  }, [userRight, userRightHandler]);

  const isEditorOpened = openToolbar || (openEdit && !isSlateValueEmpty(value)) || !isSlateValueEmpty(value);
  const pageTitle =
    location.pathname === Routes.NEW_NOTICE ? t('common:noticeList.createNewNoticeInfo') : noticeFields.title;

  return (
    <ContainerWrapper>
      <NavBar />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <DesktopAppBar />
        <ContentWrapper openedit={openEdit} opentoolbar={openToolbar}>
          {!openToolbar && <PageTitle routerName={pageTitle} />}
          {openToolbar && (
            <InputFieldWrapper>
              <TextField
                label={t('common:noticeList.writeTitle')}
                inputProps={{ maxLength: 150 }}
                value={noticeFields.title}
                helperText={`${(noticeFields.title || '').length}/150`}
                onChange={(e) => {
                  handleTitleChange(e.target.value);
                }}
                fullWidth
              />
            </InputFieldWrapper>
          )}
          {isEditorOpened && <SlateInputField />}
          {openToolbar && (
            <NoticeFieldsWrapper sx={{ margin: '0px 15px' }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fi}>
                <Grid container spacing={2}>
                  <Grid item>
                    <DateTimePicker
                      label={t('common:noticeList.publishTimeStart')}
                      value={noticeFields.publishTimeStart ? new Date(noticeFields.publishTimeStart) : null}
                      onChange={(newValue) => handleStartDateChange(newValue)}
                    />
                  </Grid>
                  <Grid item>
                    <DateTimePicker
                      label={t('common:noticeList.publishTimeEnd')}
                      value={noticeFields.publishTimeEnd ? new Date(noticeFields.publishTimeEnd) : null}
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

const InputFieldWrapper = styled(Paper)(({ theme }) => ({
  boxShadow: 'none',
  [theme.breakpoints.only('mobile')]: {
    margin: '30px 15px',
  },
  [theme.breakpoints.only('tablet')]: {
    margin: '30px 32px',
  },
  [theme.breakpoints.only('desktop')]: {
    margin: '60px 40px -30px 40px',
  },
}));
