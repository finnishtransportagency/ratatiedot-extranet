import React from 'react';
import { Cancel } from '@mui/icons-material';
import { Box, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput } from '@mui/material';
import type { Section } from '../types';

interface SectionFilterProps {
  sections: Section[];
  selectedSections: string[];
  onSectionsSelect: (sections: string[]) => void;
}

export const SectionFilter: React.FC<SectionFilterProps> = ({ sections, selectedSections, onSectionsSelect }) => {
  const handleChange = (event: any) => {
    const value = event.target.value;
    onSectionsSelect(typeof value === 'string' ? value.split(',') : value);
  };

  const handleDelete = (sectionToDelete: string) => {
    onSectionsSelect(selectedSections.filter((section) => section !== sectionToDelete));
  };

  return (
    <Box sx={{ minWidth: '180px' }}>
      <FormControl fullWidth size="small">
        <InputLabel>Rataosat</InputLabel>
        <Select
          multiple
          value={selectedSections}
          onChange={handleChange}
          input={<OutlinedInput label="Rataosat" />}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 48 * 4.5 + 8,
                width: 250,
              },
            },
          }}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map((value) => {
                const section = sections.find((a) => a.key === value);
                return (
                  <Chip
                    key={value}
                    label={section?.shortName || value}
                    size="small"
                    onDelete={() => handleDelete(value)}
                    deleteIcon={
                      <Cancel
                        onMouseDown={(event) => {
                          event.stopPropagation();
                          event.preventDefault();
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          event.preventDefault();
                          handleDelete(value);
                        }}
                      />
                    }
                  />
                );
              })}
            </Box>
          )}
        >
          {sections.map((section) => (
            <MenuItem key={section.key} value={section.key}>
              {section.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
