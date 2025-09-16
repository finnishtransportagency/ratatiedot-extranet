import React, { useState } from 'react';
import { Box, TextField, InputAdornment, IconButton, Paper } from '@mui/material';
import { Search as SearchIcon, Clear } from '@mui/icons-material';

interface BaliseSearchProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
}

export const BaliseSearch: React.FC<BaliseSearchProps> = ({ onSearch, placeholder = 'Hae baliisisanomia...' }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onSearch(searchTerm);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Paper
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          boxShadow: 1,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={clearSearch} aria-label="clear search">
                  <Clear fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            },
          }}
        />
      </Paper>
    </Box>
  );
};
