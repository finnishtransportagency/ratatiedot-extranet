import styled from '@emotion/styled';
import { Box, InputBase, Toolbar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Colors } from '../../constants/Colors';
import { isDesktopScreen } from '../../utils/helpers';

type Props = {
  children: React.ReactElement;
};

const Search = styled('div')(({ theme }) => ({
  display: 'flex',
  borderRadius: '4px',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: Colors.extrablack,
  padding: '8px 10px',
  [theme.breakpoints.down('desktop')]: {
    display: 'none',
  },
}));

export const DesktopTitleBar = ({ children }: Props) => {
  return (
    <Toolbar sx={{ padding: 0, minHeight: 0 }}>
      {children}
      <Box sx={{ flexGrow: 1 }} />
      <Search>
        <InputBase placeholder="Etsi sivustolta" inputProps={{ 'aria-label': 'search' }} />
        <SearchIcon color="primary" />
      </Search>
    </Toolbar>
  );
};
