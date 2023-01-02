import React, { useContext } from 'react';
import { InputBase, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import ArrayBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';

import { SearchContext } from '../../contexts/SearchContext';
import { RecentSearch } from './RecentSearch';
import { KeyEnum, LocalStorageHelper } from '../../utils/StorageHelper';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../constants/Routes';
import { FilterSearch } from './FilterSearch';
import { AppBarContext } from '../../contexts/AppBarContext';

type SearchProps = {
  isDesktop?: boolean;
};

// Set limit for number of searches
export const SearchStorage = new LocalStorageHelper(5);

export const Search = ({ isDesktop = false }: SearchProps) => {
  const searchContext = useContext(SearchContext);
  const { query, queryHandler } = searchContext;
  const { openSearch, toggleSearch, openFilter, toggleFilter } = useContext(AppBarContext);
  const navigate = useNavigate();

  const closeSearch = () => {
    openSearch && toggleSearch();
  };

  const enterSearch = (event: React.KeyboardEvent) => {
    if (event.code === 'Enter' && query) {
      SearchStorage.add(KeyEnum.RECENT_SEARCHES, query);
      closeSearch();
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
      <IconButton
        size="large"
        edge="start"
        area-label="back"
        onClick={() => {
          exitSearch();
        }}
      >
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
          inputRef={(input) => openSearch && input?.focus()}
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
          {openFilter ? <DisabledByDefaultIcon color="primary" /> : <TuneIcon color="primary" />}
        </IconButton>
      </>
      {openSearch && !openFilter && <RecentSearch exitSearch={exitSearch} />}
      <FilterSearch openFilter={openFilter} toggleFilter={toggleFilter} />
    </>
  );
};
