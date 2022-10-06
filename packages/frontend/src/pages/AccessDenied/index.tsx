import { Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

import RataExtLogo from '../../assets/images/Logo_long.png';
import { Container, SubtitleWrapper, BackButton, ParagraphWrapper } from './index.styles';

export const AccessDenied = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prevPath = location.state?.previousPath;

  return (
    <Container>
      <Box component="img" src={RataExtLogo} alt="Logo" />
      <SubtitleWrapper variant="subtitle2">Pääsy kieletty</SubtitleWrapper>
      <ParagraphWrapper variant="body1">Sinulla ei käyttöoikeutta Ratatiedon extranettiin.</ParagraphWrapper>
      <ParagraphWrapper variant="body1">Ota yhteys organisaatiosi käyttövaltuusvastaavaan.</ParagraphWrapper>
      {prevPath && (
        <BackButton color="primary" variant="contained" onClick={() => navigate(-1)}>
          Takaisin
        </BackButton>
      )}
    </Container>
  );
};
