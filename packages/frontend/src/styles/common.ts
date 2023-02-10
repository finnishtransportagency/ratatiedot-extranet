import { Box, Button, Typography } from '@mui/material';
import styled from '@emotion/styled';

export const ContainerWrapper = styled(Box)(({ theme }) => ({
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

export const ProtectedContainerWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.only('mobile')]: {
    margin: '16px 15px',
  },
  [theme.breakpoints.only('tablet')]: {
    margin: theme.spacing(4),
    marginTop: 0,
  },
  [theme.breakpoints.up('desktop')]: {
    margin: theme.spacing(5),
  },
}));

export const PageTitleWrapper = styled(Typography)(({ theme }) => {
  return {
    fontWeight: 700,
    fontSize: '23px',
    marginBottom: '25px',
    [theme.breakpoints.only('desktop')]: {
      fontSize: '28px',
      marginBottom: '35px',
    },
  };
});

export const ButtonWrapper = styled(Button)(({ theme }) => {
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
