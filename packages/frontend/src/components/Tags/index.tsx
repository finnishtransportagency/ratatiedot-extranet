import { Chip, Stack } from '@mui/material';
import { useContext } from 'react';

import { SearchContext } from '../../contexts/SearchContext';
import { formatYear, mapSortTypeToValue } from '../../utils/helpers';

export const Tags = () => {
  const { years, savedCheckboxes, sort } = useContext(SearchContext);
  const fromYear = formatYear(years[0]);
  const toYear = formatYear(years[1]);
  let yearRange = '';
  if (fromYear) {
    yearRange += fromYear;
    if (fromYear < toYear && toYear) {
      yearRange += `- ${toYear}`;
    }
  }

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
      {sort[0] && <Chip color="secondary" label={mapSortTypeToValue(sort[0])} />}
      {yearRange && <Chip color="secondary" label={yearRange} />}
      {Object.values(savedCheckboxes)
        .flat()
        .map((name: any, index: number) => (
          <Chip key={index} color="secondary" label={name} />
        ))}
    </Stack>
  );
};
