import styled from '@emotion/styled';
import { Typography } from '@mui/material';
import { Colors } from '../../constants/Colors';
import { appbarWidth } from '../../constants/Viewports';
import { KeyEnum, LocalStorageHelper } from '../../utils/StorageHelper';

export const RecentSearch = () => {
  const RecentSearchItems = () => {
    const items = new LocalStorageHelper().get(KeyEnum.RECENT_SEARCHES);
    return (
      items &&
      items.map((searchText: string, index: number) => (
        <Typography key={index} variant="body1">
          {searchText}
        </Typography>
      ))
    );
  };

  return (
    <RecentSearchWrapper>
      <Typography variant="body1" sx={{ color: Colors.darkgrey }}>
        VIIMEISET HAUT
      </Typography>
      <RecentSearchItems />
    </RecentSearchWrapper>
  );
};

const RecentSearchWrapper = styled('div')(({ theme }) => {
  return {
    background: Colors.white,
    position: 'absolute',
    [theme.breakpoints.down('desktop')]: {
      left: 0,
      width: '100%',
      padding: `20px ${appbarWidth}px`,
      top: `${appbarWidth + 8}px`,
      height: '100vh',
    },
    [theme.breakpoints.up('desktop')]: {
      width: '100%',
      padding: '12px',
      top: `${appbarWidth + 2}px`,
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
      borderRadius: '0px 0px 4px 4px',
    },
  };
});
