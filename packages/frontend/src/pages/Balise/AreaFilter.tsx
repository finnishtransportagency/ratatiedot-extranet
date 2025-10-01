import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput, Paper } from '@mui/material';
import { AreaConfig } from './types';

interface AreaFilterProps {
  areas: AreaConfig[];
  selectedAreas: string[];
  onAreasSelect: (areas: string[]) => void;
}

export const AreaFilter: React.FC<AreaFilterProps> = ({ areas, selectedAreas, onAreasSelect }) => {
  const handleChange = (event: any) => {
    const value = event.target.value;
    onAreasSelect(typeof value === 'string' ? value.split(',') : value);
  };

  const handleDelete = (areaToDelete: string) => {
    onAreasSelect(selectedAreas.filter((area) => area !== areaToDelete));
  };

  return (
    <Box sx={{ minWidth: '280px' }}>
      <FormControl fullWidth size="small">
        <InputLabel>Alueet</InputLabel>
        <Select
          multiple
          value={selectedAreas}
          onChange={handleChange}
          input={<OutlinedInput label="Alueet" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map((value) => {
                const area = areas.find((a) => a.key === value);
                return (
                  <Chip
                    key={value}
                    label={area?.shortName || value}
                    size="small"
                    onDelete={() => handleDelete(value)}
                    deleteIcon={<span>×</span>}
                  />
                );
              })}
            </Box>
          )}
        >
          {areas.map((area) => (
            <MenuItem key={area.key} value={area.key}>
              {area.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
