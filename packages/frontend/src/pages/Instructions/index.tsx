import { SubtitleWrapper, ParagraphWrapper } from './index.styles';
import { ProtectedContainerWrapper } from '../../styles/common';
import { Box, Grid, List, ListItem, ListItemText, Paper } from '@mui/material';
import SearchImage from '../../assets/images/instructions/search.png';
import EditImage from '../../assets/images/instructions/edit_mode.png';
import { StaticAreaFolder } from '../../components/Folders/StaticAreaFolder';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
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
