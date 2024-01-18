import React, { useContext } from 'react';
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
import { toast } from 'react-toastify';

type SearchProps = {
  isDesktop?: boolean;
};

// Set limit for number of searches
export const SearchStorage = new LocalStorageHelper(5);

export const Search = ({ isDesktop = false }: SearchProps) => {
  const { openSearch, toggleSearch, openFilter, toggleFilter, closeFilter } = useContext(AppBarContext);
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);

  const searchString = useFiltersStore((state) => state.searchString);
  const updateSearchString = useFiltersStore((state) => state.updateSearchString);
  const fetchFiles = useFileStore((state) => state.search);
  const area = useFiltersStore((state) => state.area);
  const category = useFiltersStore((state) => state.category);

  const closeSearch = () => {
    openSearch && toggleSearch();
  };

  const enterSearch = (event: React.KeyboardEvent) => {
    if (event.code === 'Enter' && searchString) {
      updateSearchString(searchString);
      search();
    }
  };

  const search = () => {
    if (area !== null && category === null) {
      toast(t('common:filter.add_category_info'), { type: 'info' });
      return;
    }
    SearchStorage.add(KeyEnum.RECENT_SEARCHES, searchString);
    closeSearch();
    closeFilter();
    navigate(`${Routes.SEARCH_RESULT}?query=${searchString}`);
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
      <IconButton size="large" edge="end" color="inherit" aria-label="open search" onClick={toggleSearch}>
        <SearchIcon color="primary" />
      </IconButton>
    );
  };

  const MiniLeftSearchBar = () => {
    return openSearch ? (
      <IconButton
        size="large"
        edge="start"
        aria-label="back"
        onClick={() => {
          exitSearch();
        }}
      >
        <ArrayBackIcon color="primary" />
      </IconButton>
    ) : (
      <IconButton size="large" edge="end" color="inherit" aria-label="open search" onClick={toggleSearch}>
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
          value={searchString}
          onChange={(event) => updateSearchString(event.target.value)}
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
