import { ProtectedContainerWrapper } from '../../../styles/common';
import { ContactEditorCardPaperWrapper } from '../../../components/Editor/Cards/ContactEditorCard';
import { HighlightedTitle } from '../../../components/Typography/HighlightedTitle';
import { ParagraphWrapper } from '../../Landing/index.styles';
import { Typography } from '@mui/material';

export const LoginAndPermissionsInstructions = () => {
  return (
    <ProtectedContainerWrapper>
      <ParagraphWrapper variant="body1">
        Ratatieto-palveluun kirjaudutaan henkilökohtaisella käyttäjätunnuksella ja salasanalla.
      </ParagraphWrapper>
      <ParagraphWrapper variant="body1">
        Jokaisella käyttäjällä on omat henkilökohtaiset käyttöoikeudet. Ratatieto-palvelussa olevia tietoja ei saa
        luovuttaa eteenpäin ilman Väyläviraston lupaa. Tietoja saa käyttää radanpidon ja liikennöinnin työtehtäviin.
      </ParagraphWrapper>
      <ParagraphWrapper variant="body1">
        Jos tarvitset uuden käyttäjätilin, käyttöoikeuksien muutoksia tai Ratatieto-palvelun sisältöön muutoksia, ota
        yhteyttä vastuuhenkilöihin.
      </ParagraphWrapper>
      <ContactEditorCardPaperWrapper>
        <HighlightedTitle>Yhteystiedot</HighlightedTitle>
        <Typography variant="subtitle2">Käyttäjätunnukset</Typography>
        <Typography variant="body1">Taina Lind</Typography>
        <Typography variant="body1">
          <a href="mailto:taina.lind@vayla.fi">taina.lind@vayla.fi</a>
        </Typography>
        <Typography variant="subtitle2">Sisältö</Typography>
        <Typography variant="body1">Merja Hyvärinen</Typography>
        <Typography variant="body1">
          <a href="mailto:merja.hyvarinen@vayla.fi">merja.hyvarinen@vayla.fi</a>
        </Typography>
      </ContactEditorCardPaperWrapper>
    </ProtectedContainerWrapper>
  );
};
