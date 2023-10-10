import React, { useContext, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { InputBase, IconButton, InputAdornment } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import ArrayBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';

import { RecentSearch } from './RecentSearch';
import { KeyEnum, LocalStorageHelper } from '../../utils/StorageHelper';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../constants/Routes';
import { FilterSearch } from './FilterSearch';
import { AppBarContext } from '../../contexts/AppBarContext';
import { useTranslation } from 'react-i18next';
import { useFiltersStore, useFileStore } from './filterStore';

type SearchProps = {
  isDesktop?: boolean;
};

// Set limit for number of searches
export const SearchStorage = new LocalStorageHelper(5);

export const Search = ({ isDesktop = false }: SearchProps) => {
  const { openSearch, toggleSearch, openFilter, toggleFilter } = useContext(AppBarContext);
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);

  const [localSearchString, setLocalSearchString] = useState('');
  const searchString = useFiltersStore((state) => state.searchString);
  const updateSearchString = useFiltersStore((state) => state.updateSearchString);
  const fetchFiles = useFileStore((state) => state.fetch);

  const closeSearch = () => {
    openSearch && toggleSearch();
  };

  const enterSearch = (event: React.KeyboardEvent) => {
    if (event.code === 'Enter' && localSearchString) {
      console.log('local: ', localSearchString);
      updateSearchString(localSearchString);
      search();
    }
  };

  const search = () => {
    console.log('search()');
    SearchStorage.add(KeyEnum.RECENT_SEARCHES, localSearchString);
    closeSearch();
    navigate(`${Routes.SEARCH_RESULT}?query=${localSearchString}`);
    fetchFiles();
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
          placeholder={t('common:action.search_site')}
          inputProps={{ 'aria-label': t('common:action.search') }}
          value={localSearchString}
          onChange={(event) => setLocalSearchString(event.target.value)}
          onKeyDown={(event) => enterSearch(event)}
          onFocus={openRecentSearch}
          onBlur={closeRecentSearch}
          endAdornment={
            <>
              <InputAdornment position="end" sx={{ visibility: searchString ? 'visible' : 'hidden' }}>
                <IconButton
                  size="large"
                  edge="end"
                  aria-label={t('common:action.erase_query')}
                  onMouseDown={() => updateSearchString('')}
                >
                  <CloseIcon color="primary" />
                </IconButton>
              </InputAdornment>
              <InputAdornment position="end">
                <IconButton size="large" edge="end" aria-label={t('common:action.filter')} onMouseDown={toggleFilter}>
                  {openFilter ? <DisabledByDefaultIcon color="primary" /> : <TuneIcon color="primary" />}
                </IconButton>
              </InputAdornment>
            </>
          }
        />
      </>
      {openSearch && !openFilter && <RecentSearch exitSearch={exitSearch} />}
      <FilterSearch filtersApplied={() => search()} />
    </>
  );
};
