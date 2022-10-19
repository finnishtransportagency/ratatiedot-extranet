import styled from '@emotion/styled';
import { Box, Typography } from '@mui/material';
import { Colors } from '../../constants/Colors';
import { ParagraphWrapper } from '../../pages/Landing/index.styles';

const TypoWrapper = styled(Typography)(() => ({
  '& .MuiTypography-root': {
    borderBottomStyle: 'solid',
    borderBottomColor: Colors.darkgreen,
    borderBottomWidth: 2,
    width: '36px',
  },
}));

const TypoWrapperStyle = {
  borderBottomStyle: 'solid',
  borderBottomColor: Colors.darkgreen,
  borderBottomWidth: 4,
  width: '36px',
  lineHeight: 1.5,
  marginBottom: '16px',
};

export const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: Colors.lightgrey,
        padding: '1px 16px',
      }}
    >
      <TypoWrapper variant="subtitle1" sx={TypoWrapperStyle}>
        Yhteystiedot
      </TypoWrapper>
      <ParagraphWrapper variant="body1">
        Käyttäjätunnukset
        <Typography variant="subtitle2">Taina Lind</Typography>
        taina.lind@vayla.fi
      </ParagraphWrapper>
      <ParagraphWrapper variant="body1">
        Sisältö
        <Typography variant="subtitle2"> Merja Hyvärinen</Typography>
        merja.hyvärinen@vayla.fi
      </ParagraphWrapper>
    </Box>
  );
};
