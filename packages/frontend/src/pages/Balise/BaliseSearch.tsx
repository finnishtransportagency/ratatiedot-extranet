import React from 'react';
import { Box, TextField, InputAdornment, IconButton } from '@mui/material';
import { Search as SearchIcon, Clear } from '@mui/icons-material';

interface BaliseSearchProps {
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
  placeholder?: string;
}

export const BaliseSearch: React.FC<BaliseSearchProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = 'Hae baliisisanomia...',
}) => {
  const handleSearch = (value: string) => {
    onSearchChange(value);
  };

  const clearSearch = () => {
    onSearchChange('');
  };

  return (
    <Box sx={{ maxWidth: 500 }}>
      <TextField
        fullWidth
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton aria-label="clear search" onClick={clearSearch} edge="end" size="small">
                <Clear />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};
