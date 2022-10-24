import { Box } from '@mui/material';
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
