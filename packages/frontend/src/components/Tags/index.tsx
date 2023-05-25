import { Chip, Stack } from '@mui/material';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchContext, Sorting } from '../../contexts/SearchContext';
import { formatYear } from '../../utils/helpers';
import { EMimeType } from '../../constants/Data';

export const Tags = () => {
  const { t } = useTranslation(['search']);
  const { years, savedCheckboxes, sort } = useContext(SearchContext);

  const getYearTagName = (): string => {
    const fromYear = formatYear(years[0]);
    const toYear = formatYear(years[1]);
    if (fromYear) {
      return fromYear < toYear ? `${fromYear} - ${toYear}` : fromYear;
    }
    return '';
  };

  const getSortingTagName = (sortRequest: Sorting) => {
    const { field, ascending } = sortRequest;
    switch (field) {
      case 'name':
        return ascending ? t('search:A-Z') : t('search:Z-A');
      case 'modified':
        return ascending ? t('search:oldest_first') : t('search:latest_first');
      default:
        return '';
    }
  };

  const getGeneralTagName = (name: string) => {
    if (name === EMimeType.Image) return t('search:image');
    return name;
  };

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
      {/* Sorting by alphabet and date */}
      {sort[0] && <Chip color="secondary" label={getSortingTagName(sort[0])} />}
      {/* Select by year range */}
      {getYearTagName() && <Chip color="secondary" label={getYearTagName()} />}
      {/* Select by mime format type and category name */}
      {Object.values(savedCheckboxes)
        .flat()
        .map((name: any, index: number) => (
          <Chip key={index} color="secondary" label={getGeneralTagName(name)} />
        ))}
    </Stack>
  );
};
