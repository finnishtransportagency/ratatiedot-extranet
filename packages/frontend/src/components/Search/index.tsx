import { useContext } from 'react';
import { InputBase, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import ArrayBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';

import { SearchContext } from '../../contexts/SearchContext';

type SearchProps = {
  openSearch?: boolean;
  toggleSearch?: React.MouseEventHandler<HTMLElement>;
};

// Only MiniAppBar (mobile/tablet screen) needs openSearch & toggleSearch
export const Search = ({ openSearch, toggleSearch }: SearchProps) => {
  const searchContext = useContext(SearchContext);
  const { query, queryHandler } = searchContext;

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
      {openSearch === undefined ? <LeftSearchBar /> : <MiniLeftSearchBar />}
      <InputBase
        fullWidth={true}
        placeholder="Etsi sivustolta"
        inputProps={{ 'aria-label': 'search' }}
        value={query}
        onChange={(event) => queryHandler(event.target.value)}
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
        onClick={() => console.log('To-do: open up filter as sidebar')}
      >
        <TuneIcon color="primary" />
      </IconButton>
    </>
  );
};
