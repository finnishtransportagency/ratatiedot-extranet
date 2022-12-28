import { Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

import RataExtLogo from '../../assets/images/Logo_long.png';
import { ContainerWrapper } from '../../styles/ContainerWrapper';
import { ButtonWrapper as BackButton } from '../../styles/ButtonWrapper';
import { SubtitleWrapper, ParagraphWrapper } from './index.styles';
import { useTranslation } from 'react-i18next';

export const AccessDenied = () => {
  const { t } = useTranslation(['accessDenied', 'common']);
  const navigate = useNavigate();
  const location = useLocation();
  const prevPath = location.state?.previousPath;

  return (
    <ContainerWrapper textAlign={'center'}>
      <Box component="img" src={RataExtLogo} alt="Logo" />
      <SubtitleWrapper variant="subtitle2">{t('accessDenied:title')}</SubtitleWrapper>
      <ParagraphWrapper variant="body1">{t('accessDenied:description_primary')}</ParagraphWrapper>
      <ParagraphWrapper variant="body1">{t('accessDenied:description_secondary')}</ParagraphWrapper>
      {prevPath && (
        <BackButton color="primary" variant="contained" onClick={() => navigate(-1)}>
          {t('common:action.back')}
        </BackButton>
      )}
    </ContainerWrapper>
  );
};
