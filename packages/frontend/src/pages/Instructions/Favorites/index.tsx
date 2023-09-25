import { ProtectedContainerWrapper } from '../../../styles/common';
import Favorites from '../../../assets/images/instructions/favorites.png';
import AddFavorite from '../../../assets/images/instructions/add_favorite.png';
import RemoveFavorite from '../../../assets/images/instructions/remove_favorite.png';
import { ParagraphWrapper, SubtitleWrapper } from '../index.styles';
import { Box } from '@mui/material';
import { Colors } from '../../../constants/Colors';

export const FavoritesInstructions = () => {
  return (
    <ProtectedContainerWrapper>
      <ParagraphWrapper variant="body1">
        Suosikit löytyvät Ratatieto-palvelun etusivusta ja myös navigaatiosta. Suosikit ovat henkilökohtaisia, eli
        jokaiselle käyttäjälle tallennetaan omat suosikit erikseen omalle käyttäjätilille.
      </ParagraphWrapper>
      <Box
        sx={{ maxWidth: '100%', height: 'auto', padding: 0, margin: 0 }}
        component="img"
        src={Favorites}
        alt="Suosikit"
      />
      <SubtitleWrapper variant="subtitle1">1. Lisää kohde suosikkeihin</SubtitleWrapper>
      <ParagraphWrapper variant="body1">
        Jos haluat lisätä kohteen suosikkeihin, mene ensin sivulle, jonka haluat merkitä suosikiksi. Painamalla lisää
        suosikkeihin -nappia sivun yläosassa valitsemasi sivu lisätään suosikkeihin ja löydät sen jatkossa
        Suosikki-kortista Ratatieto-palvelun etusivulta sekä navigaatiosta.
      </ParagraphWrapper>
      <Box
        sx={{ maxWidth: '100%', height: 'auto', padding: 0, margin: 0 }}
        component="img"
        src={AddFavorite}
        alt="Lisää suosikki"
      />
      <SubtitleWrapper variant="subtitle1">2. Poista kohde suosikeista</SubtitleWrapper>
      <ParagraphWrapper variant="body1">
        Jos haluat poistaa sivun suosikeista, menee sille sivulle, jota et haluaa pitää suosikeissa. Sivun yläosalta
        löytyy Poista suosikeista -nappi, painamalla sitä valitsemasi sivu poistuu suosikeista.
      </ParagraphWrapper>
      <Box
        sx={{ maxWidth: '100%', height: 'auto', padding: 0, margin: 0 }}
        component="img"
        src={RemoveFavorite}
        alt="Poista suosikki"
      />
    </ProtectedContainerWrapper>
  );
};
