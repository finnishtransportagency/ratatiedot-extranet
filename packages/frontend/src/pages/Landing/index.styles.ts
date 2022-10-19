import { Box, Typography } from '@mui/material';
import styled from '@emotion/styled';

export const ContainerWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('tablet')]: {
    margin: '16px 15px',
  },
  [theme.breakpoints.up('tablet')]: {
    margin: theme.spacing(4),
  },
  [theme.breakpoints.up('desktop')]: {
    margin: theme.spacing(5),
  },
}));

export const SubtitleWrapper = styled(Typography)(() => ({
  margin: '16px 0px',
  lineHeight: '32px',
})) as typeof Typography;

export const ParagraphWrapper = styled(Typography)(() => ({
  marginBottom: '16px',
})) as typeof Typography;
