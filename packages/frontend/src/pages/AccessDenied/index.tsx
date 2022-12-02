import { Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

import RataExtLogo from '../../assets/images/Logo_long.png';
import { ContainerWrapper } from '../../styles/ContainerWrapper';
import { ButtonWrapper as BackButton } from '../../styles/ButtonWrapper';
import { SubtitleWrapper, ParagraphWrapper } from './index.styles';

export const AccessDenied = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prevPath = location.state?.previousPath;

  return (
    <ContainerWrapper textAlign={'center'}>
      <Box component="img" src={RataExtLogo} alt="Logo" />
      <SubtitleWrapper variant="subtitle2">Pääsy kielletty</SubtitleWrapper>
      <ParagraphWrapper variant="body1">Sinulla ei käyttöoikeutta Ratatiedon extranettiin.</ParagraphWrapper>
      <ParagraphWrapper variant="body1">Ota yhteys organisaatiosi käyttövaltuusvastaavaan.</ParagraphWrapper>
      {prevPath && (
        <BackButton color="primary" variant="contained" onClick={() => navigate(-1)}>
          Takaisin
        </BackButton>
      )}
    </ContainerWrapper>
  );
};
