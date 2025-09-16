import React from 'react';
import { Box, Card, CardContent, Typography, Chip } from '@mui/material';
import { areas } from './mockData';

interface AreaFilterProps {
  selectedArea: string | null;
  onAreaSelect: (area: string | null) => void;
}

// Shortened area names for more compact display
const shortAreaNames: { [key: string]: string } = {
  'Alue 1 Uusimaa': 'Uusimaa',
  'Alue 2 Lounaisrannikko': 'Lounaisrannikko',
  'Alue 3 (Riihimäki)-Kokkola': 'Riihimäki-Kokkola',
  'Alue 4 Rauma- (Pieksämäki)': 'Rauma-Pieksämäki',
  'Alue 5 Haapamäen tähti': 'Haapamäki',
  'Alue 6 Savon rata': 'Savo',
  'Alue 7 Karjalan rata': 'Karjala',
  'Alue 8 Yläsavo': 'Yläsavo',
  'Alue 9 Pohjanmaan rata': 'Pohjanmaa',
  'Alue 10 Keski-Suomi': 'Keski-Suomi',
  'Alue 11 Kainuu-Oulu': 'Kainuu-Oulu',
  'Alue 12 Oulu-Lappi': 'Oulu-Lappi',
};

export const AreaFilter: React.FC<AreaFilterProps> = ({ selectedArea, onAreaSelect }) => {
  const handleAreaClick = (area: string) => {
    if (selectedArea === area) {
      onAreaSelect(null); // Deselect if already selected
    } else {
      onAreaSelect(area);
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label="Kaikki"
            clickable
            color={selectedArea === null ? 'primary' : 'default'}
            onClick={() => onAreaSelect(null)}
            variant={selectedArea === null ? 'filled' : 'outlined'}
            size="small"
          />
          {areas.map((area) => (
            <Chip
              key={area}
              label={shortAreaNames[area] || area}
              clickable
              color={selectedArea === area ? 'primary' : 'default'}
              onClick={() => handleAreaClick(area)}
              variant={selectedArea === area ? 'filled' : 'outlined'}
              size="small"
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
