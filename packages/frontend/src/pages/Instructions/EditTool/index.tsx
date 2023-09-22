import { ProtectedContainerWrapper } from '../../../styles/common';
import ActivateEditMode from '../../../assets/images/instructions/activate_edit_mode.png';
import DiscardOrSave from '../../../assets/images/instructions/discard_save.png';
import TextEditing from '../../../assets/images/instructions/text_editing.png';
import Notifications from '../../../assets/images/instructions/notifications.png';
import ToolBar from '../../../assets/images/instructions/toolbar.png';
import { SubtitleWrapper } from '../index.styles';
import { ParagraphWrapper } from '../../Landing/index.styles';
import { Box, List, ListItem, ListItemText } from '@mui/material';
import { HighlightedTitle } from '../../../components/Typography/HighlightedTitle';
import { Colors } from '../../../constants/Colors';

export const EditToolInstructions = () => {
  return (
    <ProtectedContainerWrapper>
      <ParagraphWrapper variant="body1">
        Tietyillä Ratatieto-palvelun käyttäjillä on muokkausoikeudet yhteen tai useamman sivun sisältöön.
      </ParagraphWrapper>
      <SubtitleWrapper variant="subtitle1">1. Muokkaustilan aktivointi</SubtitleWrapper>
      <ParagraphWrapper variant="body1">
        Jos käyttäjällä on käyttöoikeudet, työpöytäversiossa näkyy oikeassa yläkulmassa hakukentän vieressä Muokkaa
        sisältöä -painike ja mobiiliversiossa hakukuvakkeen vieressä muokkauskuvake (kynä). Klikkaamalla sitä pääset
        muokkaustilaan.
      </ParagraphWrapper>
      <Box
        sx={{ maxWidth: '100%', height: 'auto', padding: 0, margin: 0 }}
        component="img"
        src={ActivateEditMode}
        alt="Logo"
      />
      <SubtitleWrapper variant="subtitle1">2. Muokkaustilan käyttö</SubtitleWrapper>
      <ParagraphWrapper variant="body1">
        Kun muokkaustila on aktivoitu, voit vapaasti valita sivun sisällöstä muokattavan osan. Valinnan jälkeen
        aktivoituu osaan kuuluvat työkalut sivun ylälaidassa.
      </ParagraphWrapper>
      <Box sx={{ maxWidth: '100%', height: 'auto', padding: 0, margin: 0 }} component="img" src={ToolBar} alt="Logo" />
      <SubtitleWrapper variant="subtitle1">3. Tallenna tai hylkää muutokset</SubtitleWrapper>
      <ParagraphWrapper variant="body1">
        Kun olet tehnyt muutoksen, voit sulkea sen työkalupalkin painamalla X-painiketta. Sen jälkeen olet taas
        muokkaustyökalun perustilassa ja voit valita seuraavista vaihtoehdoista:
      </ParagraphWrapper>
      <List sx={{ listStyleType: 'disc', pl: 4 }}>
        <ListItem style={{ display: 'list-item' }}>
          <ListItemText>
            Jos haluat kumota muutoksesi ja palata aikaisempaan versioon, paina Hylkää-painiketta.
          </ListItemText>
        </ListItem>
        <ListItem style={{ display: 'list-item' }}>
          <ListItemText>Jos haluat julkaista muutoksesi kaikille käyttäjille, paina Tallenna-painiketta.</ListItemText>
        </ListItem>
      </List>
      <ParagraphWrapper variant="body1">
        Huomathan, että tätä toimintoa ei voi kumota, eli et voi palauttaa muutoksia hylkäämisen jälkeen etkä palata
        vanhaan versioon tallentamisen jälkeen.
      </ParagraphWrapper>
      <Box
        sx={{ maxWidth: '100%', height: 'auto', padding: 0, marginBottom: 4 }}
        component="img"
        src={DiscardOrSave}
        alt="Logo"
      />
      <Box
        style={{
          borderRadius: '12px',
          borderColor: Colors.midgrey,
          borderStyle: 'solid',
          borderWidth: '1px',
        }}
      >
        <Box p={2}>
          <HighlightedTitle>Vinkki ensimmäiseen kokeiluun</HighlightedTitle>
          <ParagraphWrapper variant="body1">
            Voit vapaasti kokeilla muokkaustyökalun eri toiminnallisuuksia. Kokeilun jälkeen painamalla
            Hylkää-painiketta tehtyjä muutoksia ei tallenneta eikä julkaista.
          </ParagraphWrapper>
        </Box>
      </Box>
      <SubtitleWrapper variant="subtitle1">4. Tekstin muokkaus</SubtitleWrapper>
      <ParagraphWrapper variant="body1">
        Klikkaamalla olevassa olevaan tekstiin tai lisäämällä uuden tekstin lisäyspainikkeen kautta ilmestyy yläpalkkiin
        tekstin muokkaustyökalut.
      </ParagraphWrapper>
      <ParagraphWrapper variant="body1">
        Työkalupalkin ensimmäisestä valikosta muokkaat tekstin muotoa: Leipäteksti, iso leipäteksti, pieni otsikko tai
        otsikko.
      </ParagraphWrapper>
      <ParagraphWrapper variant="body1">
        Seuraavaksi löydät formaattityökalut: Lihavoitu (B), kursivoitu (I), alleviivattu (U), tekstin väri (ympyrä),
        linkki (linkki-ikoni), bulletlista, numeroitu lista, ja työpöytäversiossa vielä sarakepainikkeet: yksi sarake
        tai kaksi saraketta.
      </ParagraphWrapper>
      <ParagraphWrapper variant="body1">
        Jos kyseessä on alasivu-kohde, niin työkalupalkista löytyy myös värivalikko (paletti-ikoni) sekä uuden
        alasivu-kohteen lisäyspainike (plus-ikoni).
      </ParagraphWrapper>
      <ParagraphWrapper variant="body1">
        Jokaisesta työkalupalkista löytyy aina valmis-painike (X-ikoni). X-painikkeesta pääsee takaisin muokkaustilan
        aloituspalkkiin.
      </ParagraphWrapper>
      <Box
        sx={{ maxWidth: '100%', height: 'auto', padding: 0, margin: 0 }}
        component="img"
        src={TextEditing}
        alt="Logo"
      />
      <SubtitleWrapper variant="subtitle1">5. Ilmoituksen lisääminen tai muokkaus</SubtitleWrapper>
      <ParagraphWrapper variant="body1">
        Sivun yläosalla löytyy 4 eri ilmoituspainiketta, josta voit lisätä uuden ilmoituksen. Haluamasi ilmoitustyypin
        mukaan valitse: sininen info-ilmoitus (ympyrä), keltainen varoitus (kolmio), punainen virhe/kriittinen
        (kahdeksankulmio) tai vihreä korjattu/vahvistus (valintamerkki).
      </ParagraphWrapper>
      <ParagraphWrapper variant="body1">
        Voit myös muokata olemassa olevaa ilmoitusta. Klikkaa ensin ilmoituksen, jonka haluat muokata, ja sitten voit
        vapaasti muokata sen tekstin, ilmoitustyypin tai poistaa koko ilmoitus (roskakori-ikoni).
      </ParagraphWrapper>
      <Box
        sx={{ maxWidth: '100%', height: 'auto', padding: 0, margin: 0 }}
        component="img"
        src={Notifications}
        alt="Logo"
      />
      <SubtitleWrapper variant="subtitle1">6. Uuden kortin, tekstikentän tai tiedoston lisääminen</SubtitleWrapper>
      <ParagraphWrapper variant="body1">
        Sivun yläosalla löytyy 4 eri ilmoituspainiketta, josta voit lisätä uuden ilmoituksen. Haluamasi ilmoitustyypin
        mukaan valitse: sininen info-ilmoitus (ympyrä), keltainen varoitus (kolmio), punainen virhe/kriittinen
        (kahdeksankulmio) tai vihreä korjattu/vahvistus (valintamerkki).
      </ParagraphWrapper>
      <ParagraphWrapper variant="body1">
        Voit myös muokata olemassa olevaa ilmoitusta. Klikkaa ensin ilmoituksen, jonka haluat muokata, ja sitten voit
        vapaasti muokata sen tekstin, ilmoitustyypin tai poistaa koko ilmoitus (roskakori-ikoni).
      </ParagraphWrapper>
      <Box
        sx={{ maxWidth: '100%', height: 'auto', padding: 0, margin: 0 }}
        component="img"
        src={Notifications}
        alt="Logo"
      />
    </ProtectedContainerWrapper>
  );
};
