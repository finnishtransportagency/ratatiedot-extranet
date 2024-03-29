import { ProtectedContainerWrapper } from '../../../styles/common';
import Filters from '../../../assets/images/instructions/filters.png';
import { ParagraphWrapper, SubtitleWrapper } from '../index.styles';
import { Box } from '@mui/material';

export const SearchAndFiltersInstructions = () => {
  return (
    <ProtectedContainerWrapper>
      <SubtitleWrapper variant="subtitle1">1. Haku</SubtitleWrapper>
      <ParagraphWrapper variant="body1">
        Ratatieto-palvelun haku löytyy työpöytäversiossa jokaisen sivun oikealta yläkulmalta ja mobiiliversiossa
        oikealta yläkulmalta. Kirjoita hakusanasi hakukentälle, kun olet valmis, paina enter-näppäintä ja tulokset-sivu
        latautuu.
      </ParagraphWrapper>
      <SubtitleWrapper variant="subtitle1">2. Suodattimet</SubtitleWrapper>
      <ParagraphWrapper variant="body1">
        Haun suodattimet löytyvät hakukentän oikeasta reunasta suodatin-kuvakkeen takaa. Suodatin-kuvakkeen painallus
        avaa hakusuodattimet ja voit vapaasti valita haluamasi suodattimet. Kun olet valmis, klikkaa Päivitä tulokset
        -nappia ja tuloksesi päivittyvät suodattimien mukaisesti. Näet myös hakutuloksen sivulta, millaiset suodattimet
        ovat käytössä. Ne on listattu pienissä mustissa laatikoissa sivun yläosassa.
      </ParagraphWrapper>
      <Box
        sx={{ maxWidth: '100%', padding: 0, flex: 1, marginBottom: '16px' }}
        component="img"
        src={Filters}
        alt="Suodatinpainikke löytyy hakupalkin oikeasta laidasta"
      />
      <ParagraphWrapper variant="body1">
        Jos haluat poistaa suodattimet, avaa uudestaan suodatin-valikkoa ja klikkaa yläosassa olevaa Poista kaikki
        suodattimet -painiketta. Voit myös poistaa valintasi yksittäin jokaisesta suodatinkohteesta, jos haluat poistaa
        vain tietyn suodattimen ja käyttää muita valittuja suodattimia vielä kerran. Klikkaa siinä tapauksessa valintasi
        jälkeen Päivitä tulokset -painiketta.
      </ParagraphWrapper>
      <ParagraphWrapper variant="body1">
        Suodatin-kuvake on näkyvissä vain silloin, kun hakukenttään on kirjoitettu hakusana.
      </ParagraphWrapper>
    </ProtectedContainerWrapper>
  );
};
