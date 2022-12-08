import { Box, ListItemText } from '@mui/material';

import RataExtLogo from '../../assets/images/Logo_long.png';
import { SubtitleWrapper, ParagraphWrapper } from '../AccessDenied/index.styles';
import { ListWrapper, ListItemWrapper } from './index.styles';
import { ContainerWrapper } from '../../styles/ContainerWrapper';
import { ButtonWrapper as HomeButton } from '../../styles/ButtonWrapper';
import { Routes } from '../../constants/Routes';

export const NotFound = () => {
  return (
    <ContainerWrapper textAlign={'center'}>
      <Box component="img" src={RataExtLogo} alt="Logo" />
      <SubtitleWrapper variant="subtitle2">Sivua ei löydy</SubtitleWrapper>
      <ParagraphWrapper variant="body1">
        Hakemasi sivu on väliaikaisesti poissa käytöstä tai sivua ei ehkä enää ole.
      </ParagraphWrapper>
      <ListWrapper>
        <ListItemText primary="TEE JOKIN SEURAAVISTA:" />
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
      <HomeButton href={Routes.LANDING} color="primary" variant="contained">
        Siirry etusivulle
      </HomeButton>
    </ContainerWrapper>
  );
};
