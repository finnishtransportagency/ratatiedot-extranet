import { Box, Button, Typography } from '@mui/material';
import styled from '@emotion/styled';

export const Container = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  [theme.breakpoints.down('tablet')]: {
    margin: '15px 16px',
  },
  [theme.breakpoints.up('tablet')]: {
    margin: theme.spacing(4),
  },
  [theme.breakpoints.up('desktop')]: {
    margin: `${theme.spacing(5)} auto`,
    width: '65%',
  },
})) as typeof Box;

export const SubtitleWrapper = styled(Typography)(() => ({
  margin: '24px',
})) as typeof Typography;

export const ParagraphWrapper = styled(Typography)(() => ({
  padding: '0 8px',
})) as typeof Typography;

export const BackButton = styled(Button)(({ theme }) => {
  return {
    marginTop: theme.spacing(4),
    padding: '9px',
    borderRadius: '100px',
    [theme.breakpoints.down('tablet')]: {
      width: '100%',
    },
    [theme.breakpoints.up('tablet')]: {
      width: '220px',
      height: '42px',
    },
  };
}) as typeof Button;
