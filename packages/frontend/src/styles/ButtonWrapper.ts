import { Button } from '@mui/material';
import styled from '@emotion/styled';

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
