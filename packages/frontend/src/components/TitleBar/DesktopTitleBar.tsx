import styled from '@emotion/styled';
import { Box, Toolbar } from '@mui/material';
import { Colors } from '../../constants/Colors';
import { Search } from '../Search';

type Props = {
  children: React.ReactElement;
};

export const DesktopTitleBar = ({ children }: Props) => {
  return (
    <Toolbar sx={{ padding: 0, minHeight: 0 }}>
      {children}
      <Box sx={{ flexGrow: 1 }} />
      <ToolbarWrapper>
        <Search />
      </ToolbarWrapper>
    </Toolbar>
  );
};

const ToolbarWrapper = styled(Toolbar)(({ theme }) => ({
  [theme.breakpoints.down('desktop')]: {
    display: 'none',
  },
  [theme.breakpoints.up('desktop')]: {
    '& .MuiToolbar-root ': {
      padding: '0px 20px',
    },
    borderRadius: '4px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: Colors.extrablack,
  },
}));
