import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import RataExtLogo from '../../assets/images/Logo_long.png';

import { useNavigate } from 'react-router-dom';
import { SubtitleWrapper, ParagraphWrapper } from '../Landing/index.styles';
import { ButtonWrapper, ContainerWrapper, ProtectedContainerWrapper } from '../../styles/common';
import { Routes } from '../../constants/Routes';

export const AcceptInstructions = () => {
  const { t } = useTranslation(['common', 'landing']);
  const navigate = useNavigate();

  const acceptTerm = () => {
    localStorage.setItem('isFirstLogin', 'false');
    navigate(Routes.HOME);
  };

  return (
    <ContainerWrapper textAlign={'center'}>
      <Box component="img" src={RataExtLogo} alt="Logo" />
      <SubtitleWrapper variant="subtitle1">{t('landing:first_login.title')}</SubtitleWrapper>
      <ParagraphWrapper variant="body1">{t('landing:first_login.description_primary')}</ParagraphWrapper>
      <ParagraphWrapper variant="body1">{t('landing:first_login.description_secondary')}</ParagraphWrapper>
      <Typography variant="subtitle2">{t('landing:first_login.must_accept')}</Typography>
      <ButtonWrapper color="primary" variant="contained" onClick={acceptTerm}>
        {t('common:action.accept')}
      </ButtonWrapper>
    </ContainerWrapper>
  );
};
