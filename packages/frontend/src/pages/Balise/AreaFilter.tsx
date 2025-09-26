import React from 'react';
import { Box, Card, CardContent, Chip } from '@mui/material';
import { AreaConfig } from './types';

interface AreaFilterProps {
  areas: AreaConfig[];
  selectedArea: string | null;
  onAreaSelect: (area: string | null) => void;
}

export const AreaFilter: React.FC<AreaFilterProps> = ({ areas, selectedArea, onAreaSelect }) => {
  const handleAreaClick = (area: string) => {
    if (selectedArea === area) {
      onAreaSelect(null); // Deselect if already selected
    } else {
      onAreaSelect(area); // Select new area
    }
  };

  const handleAllClick = () => {
    onAreaSelect(null);
  };

  return (
    <Card variant="outlined">
      <CardContent sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          {/* All areas option */}
          <Chip
            label="Kaikki alueet"
            size="small"
            color={selectedArea === null ? 'primary' : 'default'}
            onClick={handleAllClick}
            variant={selectedArea === null ? 'filled' : 'outlined'}
          />

          {/* Individual area options */}
          {areas.map((area) => (
            <Chip
              key={area.key}
              label={area.shortName}
              size="small"
              color={selectedArea === area.key ? 'primary' : 'default'}
              onClick={() => handleAreaClick(area.key)}
              variant={selectedArea === area.key ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
