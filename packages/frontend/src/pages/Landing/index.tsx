import { useTranslation } from 'react-i18next';

import { SubtitleWrapper, ParagraphWrapper } from './index.styles';
import { ProtectedContainerWrapper } from '../../styles/common';
import { Link } from '@mui/material';

export const Landing = () => {
  const { t } = useTranslation(['common', 'landing']);

  return (
    <ProtectedContainerWrapper>
      <SubtitleWrapper variant="subtitle1">{t('landing:welcome.text')}</SubtitleWrapper>
      <ParagraphWrapper variant="body1">{t('landing:welcome.description_primary')}</ParagraphWrapper>
      <ParagraphWrapper variant="body1">{t('landing:welcome.description_secondary')}</ParagraphWrapper>
      <ParagraphWrapper variant="body1">
        {t('landing:welcome.contact')}
        <Link
          href="mailto:ratatieto@vayla.fi"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline', textDecoration: 'none' }}
        >
          ratatieto@vayla.fi
        </Link>
        .
      </ParagraphWrapper>
      <SubtitleWrapper variant="subtitle1">Ajankohtaista</SubtitleWrapper>
      <SubtitleWrapper variant="subtitle2">Tiedostojen tallentaminen</SubtitleWrapper>
      <ParagraphWrapper variant="body1">
        Yli 1 Mt tiedostojen tallentaminen järjestelmään ei välttämättä toimi ja virheen sattuessa pitää tiedosto
        tallentaa suoraan Alfrescoon.
      </ParagraphWrapper>
      <SubtitleWrapper variant="subtitle2">Tiedostojen päivämäärät</SubtitleWrapper>
      <ParagraphWrapper variant="body1">
        Järjestelmämuutoksen (Ratatiedon extranet-&gt;Ratatieto) yhteydessä siirrettiin aineisto uuteen palveluun
        sellaisenaan. Kunkin siirretyn tiedoston alkuperäinen luontiajankohta ei ole enää nähtävillä. Jos tiedoston alla
        on pelkkä viiva, tarkoittaa se, että tiedosto on luotu ennen huhtikuuta 2023. Jos tuolla kohdalla on päivämäärä,
        ilmoittaa se ajankohtaa jolloin tiedosto on luotu tai päivitetty massa-aineistosiirron jälkeen.'
      </ParagraphWrapper>
    </ProtectedContainerWrapper>
  );
};
