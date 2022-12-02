import { Typography } from '@mui/material';
import { useState } from 'react';

import { ContainerWrapper, SubtitleWrapper, ParagraphWrapper } from './index.styles';
import { ButtonWrapper } from '../../styles/ButtonWrapper';
import { Footer } from '../../components/Footer';
import { useQuery } from '@tanstack/react-query';

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
        <Typography variant="subtitle2">Jatkakseesi palveluun sinun on hyväksyttävä käyttöohjeet.</Typography>
        <ButtonWrapper color="primary" variant="contained" onClick={acceptTerm}>
          Hyväksy
        </ButtonWrapper>
      </>
    );
  };

  const LandingView = () => {
    useQuery({
      queryKey: ['dummy2'],
      queryFn: async () => {
        const response = await fetch('/api/test');
        if (!response.ok) {
          throw new Error('Dummy2 failed');
        }
        return response.json();
      },
    });
    return (
      <>
        <SubtitleWrapper variant="subtitle1">Tervetuloa uudistuneeseen Ratatiedon extranettiin</SubtitleWrapper>
        <ParagraphWrapper variant="body1">
          Tarkista ajankohtaiset ilmoitukset, viimeksi muokatut tiedostot ja omat suosikit suoraan tältä sivulta. Voit
          siirtyä myös muihin aineistoihin navigaation tai haun kautta.
        </ParagraphWrapper>
        <Footer />
      </>
    );
  };

  return <ContainerWrapper>{isFirstLogin ? <FirstLoginView /> : <LandingView />}</ContainerWrapper>;
};
