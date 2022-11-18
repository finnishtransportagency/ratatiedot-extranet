import React, { useContext } from 'react';
import { InputBase, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import ArrayBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';

import { SearchContext } from '../../contexts/SearchContext';
import { RecentSearch } from './RecentSearch';
import { KeyEnum, LocalStorageHelper } from '../../utils/StorageHelper';

type SearchProps = {
  openSearch: boolean;
  toggleSearch: any;
  isDesktop?: boolean;
};

export const Search = ({ openSearch, toggleSearch, isDesktop = false }: SearchProps) => {
  const searchContext = useContext(SearchContext);
  const { query, queryHandler } = searchContext;

  // Set limit for number of searches
  const SearchStorage = new LocalStorageHelper(5);

  const enterSearch = (event: React.KeyboardEvent) => {
    if (event.code === 'Enter' && query) {
      SearchStorage.add(KeyEnum.RECENT_SEARCHES, query);
      // TODO: Navigate to new SearchPage (path /haku)
    }
  };

  const openRecentSearch = () => !openSearch && toggleSearch();
  const closeRecentSearch = () => openSearch && toggleSearch();

  const LeftSearchBar = () => {
    return (
      <IconButton size="large" edge="end" color="inherit" area-label="open search" onClick={toggleSearch}>
        <SearchIcon color="primary" />
      </IconButton>
    );
  };

  const MiniLeftSearchBar = () => {
    return openSearch ? (
      <IconButton size="large" edge="start" area-label="back" onClick={toggleSearch}>
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
          onBlur={closeRecentSearch}
        />
        {query && (
          <IconButton size="large" edge="end" area-label="erase query" onClick={() => queryHandler('')}>
            <CloseIcon color="primary" />
          </IconButton>
        )}
        <IconButton
          size="large"
          edge="end"
          area-label="filter"
          onClick={() => console.log('TODO: open up filter as sidebar')}
        >
          <TuneIcon color="primary" />
        </IconButton>
      </>
      {openSearch && <RecentSearch />}
    </>
  );
};
