import { Chip, Stack } from '@mui/material';
import { useContext } from 'react';

import { SearchContext } from '../../contexts/SearchContext';
import { formatYear } from '../../utils/helpers';

export const Tags = () => {
  const { years, savedCheckboxes } = useContext(SearchContext);
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
      {yearRange && <Chip color="secondary" label={yearRange} />}
      {Object.values(savedCheckboxes)
        .flat()
        .map((name: any, index: number) => (
          <Chip key={index} color="secondary" label={name} />
        ))}
    </Stack>
  );
};
