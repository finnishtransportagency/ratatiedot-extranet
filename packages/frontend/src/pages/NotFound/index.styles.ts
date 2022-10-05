import { Button, List, ListItem } from '@mui/material';
import styled from '@emotion/styled';
import { Colors } from '../../constants/Colors';
import { theme } from '../../styles/createTheme';

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

export const ListWrapper = styled(List)(() => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: Colors.lightgrey,
  textAlign: 'left',
}));

export const ListItemWrapper = styled(ListItem)(() => ({
  listStyleType: 'disc',
  display: 'list-item',
  marginLeft: theme.spacing(1),
  padding: '0 8px',
}));
