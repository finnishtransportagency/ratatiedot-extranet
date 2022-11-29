import { Chip, Stack } from '@mui/material';
import { useContext } from 'react';
import { SearchContext } from '../../contexts/SearchContext';

export const Tags = () => {
  const { checkedList, checkedListHandler } = useContext(SearchContext);
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
      {checkedList.map((name: string) => (
        <Chip color="secondary" label={name} onDelete={() => checkedListHandler(name)} />
      ))}
    </Stack>
  );
};
