import { Box, ListItemText } from '@mui/material';

import RataExtLogo from '../../assets/images/Logo_long.png';
import { Container, SubtitleWrapper, BackButton, ParagraphWrapper } from '../AccessDenied/index.styles';
import { ListWrapper, ListItemWrapper } from './index.styles';

export const NotFound = () => {
  return (
    <Container>
      <Box component="img" src={RataExtLogo} alt="Logo" />
      <SubtitleWrapper variant="subtitle2">Sivua ei löydy</SubtitleWrapper>
      <ParagraphWrapper variant="body1">
        Hakemasi sivu on väliaikaisesti poissa käytöstä, tai sivua ei ehkä enää ole.
      </ParagraphWrapper>
      <ListWrapper>
        <ListItemText primary="TEE JOKIN SEURAAVUSTA:" />
        <ListItemWrapper sx={{ display: 'list-item' }}>
          <ListItemText primary="Yritä muodostaa yhteys uudelleen napsauttamalla selaimen Päivitä-painiketta." />
        </ListItemWrapper>
        <ListItemWrapper sx={{ display: 'list-item' }}>
          <ListItemText
            primary="
Tarkista URL-osoitteen oikeinkirjoitus (tarkista isot ja pienet kirjaimet sekä välimerkit) ja napsauta selaimen Päivitä-painiketta."
          />
        </ListItemWrapper>
        <ListItemWrapper sx={{ display: 'list-item' }}>
          <ListItemText primary="Palaa edelliselle sivulle napsauttamalla selaimen Edellinen-painiketta." />
        </ListItemWrapper>
      </ListWrapper>
      <BackButton href="/" color="primary" variant="contained">
        Sirry etusivulle
      </BackButton>
    </Container>
  );
};
