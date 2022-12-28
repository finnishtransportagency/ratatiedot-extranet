import styled from '@emotion/styled';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SearchStorage } from '.';

import { Colors } from '../../constants/Colors';
import { Routes } from '../../constants/Routes';
import { appbarWidth } from '../../constants/Viewports';
import { KeyEnum } from '../../utils/StorageHelper';

type RecentSearchProps = {
  exitSearch: () => void;
};

export const RecentSearch = ({ exitSearch }: RecentSearchProps) => {
  const { t } = useTranslation(['search']);

  const RecentSearchItems = () => {
    const items = SearchStorage.get(KeyEnum.RECENT_SEARCHES);
    return (
      items &&
      items.map((searchText: string, index: number) => (
        <Typography key={index} variant="body1">
          <CustomLink
            to={`${Routes.SEARCH_RESULT}?query=${searchText}`}
            onClick={() => {
              SearchStorage.add(KeyEnum.RECENT_SEARCHES, searchText);
              exitSearch();
            }}
          >
            {searchText}
          </CustomLink>
        </Typography>
      ))
    );
  };

  return (
    <RecentSearchWrapper>
      <Typography variant="body1" sx={{ color: Colors.darkgrey }}>
        {t('search:last_searches')}
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

const CustomLink = styled(Link)(() => ({
  textDecoration: 'none',
  color: Colors.extrablack,
  '&:hover': {
    color: Colors.darkblue,
  },
}));
