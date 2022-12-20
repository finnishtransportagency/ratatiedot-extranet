import { Chip, Stack } from '@mui/material';
import { useContext } from 'react';
import { format } from 'date-fns';

import { SearchContext } from '../../contexts/SearchContext';

export const Tags = () => {
  const { years, checkedList } = useContext(SearchContext);
  const fromYear = years[0] ? format(years[0], 'yyyy') : '';
  const toYear = years[1] ? format(years[1], 'yyyy') : '';
  let yearRange = '';
  if (fromYear) {
    yearRange += fromYear;
  }
  if (toYear) {
    yearRange += `- ${toYear}`;
  }

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
      {yearRange && <Chip color="secondary" label={yearRange} />}
      {Object.values(checkedList)
        .flat()
        .map((name: any, index: number) => (
          <Chip key={index} color="secondary" label={name} />
        ))}
    </Stack>
  );
};
