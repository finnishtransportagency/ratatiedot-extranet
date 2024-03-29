import styled from '@emotion/styled';
import { Box, Button, Grid } from '@mui/material';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import CheckIcon from '@mui/icons-material/Check';
import { toast } from 'react-toastify';

import CloseIcon from '../../assets/icons/Close.svg';
import { Colors } from '../../constants/Colors';
import { AppBarContext } from '../../contexts/AppBarContext';
import { ParagraphWrapper } from '../../pages/Landing/index.styles';
import { EditorContext } from '../../contexts/EditorContext';
import { useLocation, useMatch, useParams } from 'react-router-dom';
import { useUpdatePageContents } from '../../hooks/mutations/UpdateCategoryPageContent';
import { getRouterName } from '../../utils/helpers';
import { useUpdateNoticePageContents } from '../../hooks/mutations/UpdateNoticePageContent';
import { useCreateNoticePageContent } from '../../hooks/mutations/CreateNoticePageContent';

export const ConfirmationAppBar = () => {
  const { toggleEdit, openToolbarHandler } = useContext(AppBarContext);
  const { value, valueReset, noticeFields, selectedImage } = useContext(EditorContext);
  const { pathname } = useLocation();
  const categoryName = pathname.split('/').at(-1) || '';
  const noticeRoute = useMatch('/ajankohtaista/:id/:date');
  const noticeCreateRoute = useMatch('/ajankohtaista/uusi');
  const { id: noticeId } = useParams();

  let isCreateRoute = false;
  if (noticeRoute && noticeRoute.params.id === 'uusi') {
    isCreateRoute = true;
  }
  const { t } = useTranslation(['common']);

  const mutatePageContents = useUpdatePageContents(getRouterName(categoryName));
  const mutateNoticePageContents = useUpdateNoticePageContents(noticeId!);
  const createNoticePageContent = useCreateNoticePageContent();
  const { error } = mutatePageContents;

  const handleReject = () => {
    toggleEdit();
    valueReset();
  };

  const handleSave = () => {
    if (noticeRoute && !isCreateRoute) {
      mutateNoticePageContents.mutate(
        { value, noticeFields, selectedImage },
        {
          onSuccess: () => {
            toast(t('common:edit.saved_success'), { type: 'success' });
            toggleEdit();
          },
          onError: () => {
            toast(error ? error.message : t('common:edit.saved_failure'), { type: 'error' });
          },
        },
      );
    } else if (noticeCreateRoute || isCreateRoute) {
      createNoticePageContent.mutate(
        { value, noticeFields, selectedImage },
        {
          onSuccess: () => {
            toast(t('common:edit.saved_success'), { type: 'success' });
            toggleEdit();
          },
          onError: () => {
            toast(error ? error.message : t('common:edit.saved_failure'), { type: 'error' });
          },
        },
      );
    } else {
      mutatePageContents.mutate(
        { value, selectedImage },
        {
          onSuccess: () => {
            toast(t('common:edit.saved_success'), { type: 'success' });
            toggleEdit();
          },
          onError: () => {
            toast(error ? error.message : t('common:edit.saved_failure'), { type: 'error' });
          },
        },
      );
    }
  };

  return (
    <ContainerWrapper container>
      <Grid item>
        <ParagraphWrapper variant="body1">{t('common:edit.save_changes_confirmation')}</ParagraphWrapper>
        <ButtonWrapper onClick={handleReject}>{t('common:action.reject')}</ButtonWrapper>
        <ButtonWrapper variant="contained" onClick={handleSave}>
          <CheckIcon fontSize="small" />
          {t('common:action.save')}
        </ButtonWrapper>
      </Grid>
      <Grid item>
        <Box
          aria-label={t('common:action.close')}
          component="img"
          sx={{ cursor: 'pointer', marginLeft: 'auto' }}
          src={CloseIcon}
          alt="close"
          onClick={openToolbarHandler}
        />
      </Grid>
    </ContainerWrapper>
  );
};

const ContainerWrapper = styled(Grid)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: Colors.aliceblue,
  borderBottom: `1px dashed ${Colors.darkblue}`,
  padding: '16px 15px',
  width: '100%',
  [theme.breakpoints.only('desktop')]: {
    padding: '30px 40px',
  },
}));

export const ButtonWrapper = styled(Button)({
  padding: '9px 24px',
  borderRadius: '100px',
});
