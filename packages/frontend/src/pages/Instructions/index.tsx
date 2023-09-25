import { SubtitleWrapper } from './index.styles';
import { ProtectedContainerWrapper } from '../../styles/common';
import { Link } from 'react-router-dom';

export const Instructions = () => {
  return (
    <ProtectedContainerWrapper>
      <SubtitleWrapper variant="subtitle1">Käyttöohjeet</SubtitleWrapper>
      <Link to="/kayttoohjeet/haku-ja-suodattimet">haku ja suodattimet</Link>
      <Link to="/kayttoohjeet/suosikit">suosikit</Link>
      <Link to="/kayttoohjeet/kirjautuminen-ja-kayttooikeudet">kirjautuminen ja käyttöoikeudet</Link>
      <Link to="/kayttoohjeet/muokkaustyokalu">muokkaustyökalu</Link>
    </ProtectedContainerWrapper>
  );
};
