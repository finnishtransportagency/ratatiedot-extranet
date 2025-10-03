import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';

import { AreaConfig } from './types';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

interface AreaFilterProps {
  areas: AreaConfig[];
  selectedArea: string[];
  onAreaSelect: (area: string | string[]) => void;
}

export const AreaFilter: React.FC<AreaFilterProps> = ({ areas, selectedArea, onAreaSelect }) => {
  const handleChange = (e: SelectChangeEvent<typeof selectedArea>) => {
    const {
      target: { value },
    } = e;
    e.preventDefault();

    onAreaSelect(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <Card variant="outlined">
      <CardContent sx={{ pb: 2 }}>
        <FormControl fullWidth>
          <Select
            labelId="demo-multiple-chip-label"
            id="demo-multiple-chip"
            multiple
            value={selectedArea}
            onChange={handleChange}
            input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
            displayEmpty
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                {/* All areas option */}
                {selected.length === 0 && (
                  <Chip
                    label="Kaikki alueet"
                    onDelete={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('onDelete', e);
                    }}
                  />
                )}
                {selected.map((value) => (
                  <Chip
                    key={value}
                    label={value}
                    onDelete={(e) => {
                      // TODO: Implement chip delete functionality
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('onDelete', e);
                    }}
                  />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {areas.map(({ key, name, shortName }) => (
              <MenuItem key={name} value={name}>
                <Checkbox checked={selectedArea.includes(name)} />
                <ListItemText primary={name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  );
};
