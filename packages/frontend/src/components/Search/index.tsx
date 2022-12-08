import React, { useContext } from 'react';
import { InputBase, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import ArrayBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';

import { SearchContext } from '../../contexts/SearchContext';
import { RecentSearch } from './RecentSearch';
import { KeyEnum, LocalStorageHelper } from '../../utils/StorageHelper';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../constants/Routes';
import { FilterSearch } from './FilterSearch';

type SearchProps = {
  openSearch: boolean;
  openFilter: boolean;
  toggleSearch: any;
  toggleFilter: any;
  isDesktop?: boolean;
};

export const Search = ({ openSearch, toggleSearch, openFilter, toggleFilter, isDesktop = false }: SearchProps) => {
  const searchContext = useContext(SearchContext);
  const { query, queryHandler } = searchContext;
  const navigate = useNavigate();

  // Set limit for number of searches
  const SearchStorage = new LocalStorageHelper(5);

  const closeSearch = () => {
    openSearch && toggleSearch();
  };

  const enterSearch = (event: React.KeyboardEvent) => {
    if (event.code === 'Enter' && query) {
      SearchStorage.add(KeyEnum.RECENT_SEARCHES, query);
      closeSearch();
      // TODO: Navigate to new SearchPage (path /haku)
      navigate(`${Routes.SEARCH_RESULT}?query=${query}`);
    }
  };

  const openRecentSearch = () => !openSearch && toggleSearch();
  const closeRecentSearch = () => openSearch && toggleSearch();
  const closeFilterSearch = () => openFilter && toggleFilter();

  const exitSearch = () => {
    closeRecentSearch();
    closeFilterSearch();
  };
  const LeftSearchBar = () => {
    return (
      <IconButton size="large" edge="end" color="inherit" area-label="open search" onClick={toggleSearch}>
        <SearchIcon color="primary" />
      </IconButton>
    );
  };

  const MiniLeftSearchBar = () => {
    return openSearch ? (
      <IconButton size="large" edge="start" area-label="back" onClick={exitSearch}>
        <ArrayBackIcon color="primary" />
      </IconButton>
    ) : (
      <IconButton size="large" edge="end" color="inherit" area-label="open search" onClick={toggleSearch}>
        <SearchIcon color="primary" />
      </IconButton>
    );
  };

  return (
    <>
      <>
        {isDesktop ? <LeftSearchBar /> : <MiniLeftSearchBar />}
        <InputBase
          fullWidth={true}
          placeholder="Etsi sivustolta"
          inputProps={{ 'aria-label': 'search' }}
          value={query}
          onChange={(event) => queryHandler(event.target.value)}
          onKeyDown={(event) => enterSearch(event)}
          onFocus={openRecentSearch}
        />
        {query && (
          <IconButton size="large" edge="end" area-label="erase query" onClick={() => queryHandler('')}>
            <CloseIcon color="primary" />
          </IconButton>
        )}
        <IconButton size="large" edge="end" area-label="filter" onClick={toggleFilter}>
          <TuneIcon color="primary" />
        </IconButton>
      </>
      {openSearch && !openFilter && <RecentSearch />}
      <FilterSearch openFilter={openFilter} toggleFilter={toggleFilter} />
    </>
  );
};
