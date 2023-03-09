import styled from '@emotion/styled';
import { Button, Grid } from '@mui/material';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import CheckIcon from '@mui/icons-material/Check';

import { Colors } from '../../constants/Colors';
import { AppBarContext } from '../../contexts/AppBarContext';
import { ParagraphWrapper } from '../../pages/Landing/index.styles';
import { EditorContext } from '../../contexts/EditorContext';

export const ConfirmationAppBar = () => {
  const { toggleEdit } = useContext(AppBarContext);
  const { valueReset } = useContext(EditorContext);

  const { t } = useTranslation(['common']);

  const handleReject = () => {
    toggleEdit();
    valueReset();
  };

  return (
    <ContainerWrapper container columns={{ desktop: 12 }}>
      <Grid item desktop={8}>
        <ParagraphWrapper variant="body2">{t('common:edit.edit_content')}</ParagraphWrapper>
        <ParagraphWrapper variant="body1">{t('common:edit.edit_instruction')}</ParagraphWrapper>
      </Grid>
      <Grid item desktop={4}>
        <ParagraphWrapper variant="body1">{t('common:edit.save_changes_confirmation')}</ParagraphWrapper>
        <ButtonWrapper onClick={handleReject}>{t('common:action.reject')}</ButtonWrapper>
        <ButtonWrapper variant="contained">
          <CheckIcon fontSize="small" />
          {t('common:action.save')}
        </ButtonWrapper>
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

const ButtonWrapper = styled(Button)({
  padding: '9px 24px',
  borderRadius: '100px',
});
