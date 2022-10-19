import { Typography } from '@mui/material';
import { useState } from 'react';

import { ContainerWrapper, SubtitleWrapper, ParagraphWrapper } from './index.styles';
import { ButtonWrapper } from '../../styles/ButtonWrapper';
import { Footer } from '../../components/Footer';

export const Landing = () => {
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
        <SubtitleWrapper variant="subtitle1">Käyttöohjeet: Ratatiedon extranet</SubtitleWrapper>
        <ParagraphWrapper variant="body1">
          Ratatiedon extranettiin kerätty aineisto on tarkoitettu liikenteenohjaukselle, isännöitsijöille,
          kunnossapitäjille, rakentajille ja liikennöijille. Tietoja ei saa luovuttaa eteenpäin ilman Väyläviraston
          lupaa. Tietoja saa käyttää radanpidon ja liikennöinnin työtehtäviin.
        </ParagraphWrapper>
        <ParagraphWrapper variant="body1">
          Ratatiedon extranetin käyttäjät ovat sitoutuneet noudattamaan ylläolevia palvelun sääntöjä. Palvelun tunnukset
          ovat henkilökohtaiset.
        </ParagraphWrapper>
        <Typography variant="subtitle2">Jatkakseesi palveluun, sinun on hyväksyttävä käyttöohjeet.</Typography>
        <ButtonWrapper color="primary" variant="contained" onClick={acceptTerm}>
          Hyväksy
        </ButtonWrapper>
      </>
    );
  };

  const LandingView = () => {
    return (
      <>
        <SubtitleWrapper variant="subtitle1">Tervetuloa uudistuneeseen Ratatiedon extranettiin</SubtitleWrapper>
        <ParagraphWrapper variant="body1">
          Tarkista ajankohtaiset ilmoitukset, viimeksi muokatut tiedostot ja omat suosikit suoraan tältä sivulta tai
          löydä muut aineistot navigaatiosta tai haun kautta.
        </ParagraphWrapper>
        <Footer />
      </>
    );
  };

  return (
    <ContainerWrapper>
      <Typography variant="subtitle2">Etusivu</Typography>
      {isFirstLogin ? <FirstLoginView /> : <LandingView />}
    </ContainerWrapper>
  );
};
