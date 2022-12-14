import styled from '@emotion/styled';
import { Box } from '@mui/material';

export const ProtectedContainerWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('desktop')]: {
    display: 'block',
  },
  [theme.breakpoints.up('desktop')]: {
    display: 'flex',
    '& .MuiToolbar-root': {
      padding: 0,
    },
  },
}));

export const ContentWrapper = styled('div')(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('desktop')]: {
    marginTop: '90px',
  },
}));
