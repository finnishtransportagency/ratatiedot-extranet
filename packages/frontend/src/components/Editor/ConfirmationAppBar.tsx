import styled from '@emotion/styled';
import { Button, Grid } from '@mui/material';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CheckIcon from '@mui/icons-material/Check';

import { Colors } from '../../constants/Colors';
import { AppBarContext } from '../../contexts/AppBarContext';
import { ParagraphWrapper } from '../../pages/Landing/index.styles';
import { EditorContext } from '../../contexts/EditorContext';
import { useLocation } from 'react-router-dom';
import { useUpdatePageContents } from '../../hooks/mutations/UpdateCategoryPageContent';
import { getRouterName } from '../../utils/helpers';
import { isSlateValueEmpty } from '../../utils/slateEditorUtil';
import { SnackbarAlert } from '../Notification/Snackbar';

export const ConfirmationAppBar = () => {
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toggleEdit } = useContext(AppBarContext);
  const { value, valueReset } = useContext(EditorContext);
  const { pathname } = useLocation();
  const categoryName = pathname.split('/').at(-1) || '';

  const { t } = useTranslation(['common']);

  const mutatePageContents = useUpdatePageContents(getRouterName(categoryName));
  const { error } = mutatePageContents;

  const handleReject = () => {
    toggleEdit();
    valueReset();
  };

  const handleSave = () => {
    mutatePageContents.mutate(value, {
      onSuccess: () => {
        setIsSuccess(true);
        toggleEdit();
      },
      onError: () => {
        setIsError(true);
      },
    });
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
      <SnackbarAlert
        open={isError}
        onSnackbarClose={() => setIsError(false)}
        color={Colors.darkred}
        text={error ? (error as Error).message : 'Texts cannot be saved'}
      ></SnackbarAlert>
      <SnackbarAlert
        open={isSuccess}
        onSnackbarClose={() => setIsSuccess(false)}
        color={Colors.black}
        text="Texts are saved successfully"
      ></SnackbarAlert>
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

const ButtonWrapper = styled(Button)({
  padding: '9px 24px',
  borderRadius: '100px',
});
