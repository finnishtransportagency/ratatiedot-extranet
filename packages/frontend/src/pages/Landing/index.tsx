import { Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ContainerWrapper, SubtitleWrapper, ParagraphWrapper } from './index.styles';
import { ButtonWrapper } from '../../styles/ButtonWrapper';
import { Footer } from '../../components/Footer';

export const Landing = () => {
  const { t } = useTranslation(['common', 'landing']);

  // temporary state -> should save in db instead
  const [isFirstLogin, setIsFirstLogin] = useState(() => {
    const saved = localStorage.getItem('isFirstLogin') || 'true';
    const initialValue = JSON.parse(saved);
    return initialValue === 'true' || initialValue;
  });

  const acceptTerm = () => {
    setIsFirstLogin(false);
    localStorage.setItem('isFirstLogin', 'false');
  };

  const FirstLoginView = () => {
    return (
      <>
        <SubtitleWrapper variant="subtitle1">{t('landing:first_login.title')}</SubtitleWrapper>
        <ParagraphWrapper variant="body1">{t('landing:first_login.description_primary')}</ParagraphWrapper>
        <ParagraphWrapper variant="body1">{t('landing:first_login.description_secondary')}</ParagraphWrapper>
        <Typography variant="subtitle2">{t('landing:first_login.must_accept')}</Typography>
        <ButtonWrapper color="primary" variant="contained" onClick={acceptTerm}>
          {t('common:action.accept')}
        </ButtonWrapper>
      </>
    );
  };

  const LandingView = () => {
    return (
      <>
        <SubtitleWrapper variant="subtitle1">{t('landing:welcome.text')}</SubtitleWrapper>
        <ParagraphWrapper variant="body1">{t('landing:welcome.description')}</ParagraphWrapper>
        <Footer />
      </>
    );
  };

  return <ContainerWrapper>{isFirstLogin ? <FirstLoginView /> : <LandingView />}</ContainerWrapper>;
};
