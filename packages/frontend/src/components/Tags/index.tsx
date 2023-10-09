import { Chip, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { formatYear } from '../../utils/helpers';
import { EMimeType } from '../../constants/Data';
import { SearchParameterName } from '../Search/FilterSearchData';

export const Tags = () => {
  const { t } = useTranslation(['search']);
  const savedCheckboxes = {
    mimeTypes: ['image'],
    categories: ['category'],
  };
  const sort = [
    {
      field: 'name',
      ascending: true,
    },
  ];

  const pageHandler = (pageNumber: number) => {
    console.log(pageNumber);
  };

  const sortHandler = (sort: string) => {
    console.log(sort);
  };

  const yearsHandler = (fromYear: Date | null, toYear: Date | null) => {
    console.log(fromYear, toYear);
  };

  const savedCheckboxesHandler = (checkboxes: any) => {
    console.log(checkboxes);
  };

  const getYearTagName = (): string => {
    const fromYear = formatYear(new Date());
    const toYear = formatYear(new Date());
    if (fromYear) {
      return fromYear < toYear ? `${fromYear} - ${toYear}` : fromYear;
    }
    return '';
  };

  const getSortingTagName = (sortRequest: any) => {
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

  const removeSortingTag = () => {
    sortHandler('');
    pageHandler(0);
  };

  const removeYearTag = () => {
    yearsHandler(null, null);
    pageHandler(0);
  };

  const removeCheckboxTag = (type: SearchParameterName, name: string) => {
    savedCheckboxesHandler((prevData: any) => {
      return {
        ...prevData,
        [type]: prevData[type].filter((item: string) => item !== name),
      };
    });
    pageHandler(0);
  };

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
      {/* Sorting by alphabet and date */}
      {sort[0] && <Chip color="secondary" label={getSortingTagName(sort[0])} onDelete={removeSortingTag} />}
      {/* Select by year range */}
      {getYearTagName() && <Chip color="secondary" label={getYearTagName()} onDelete={removeYearTag} />}
      {/* Select by mime format type and category name */}
      {Object.entries(savedCheckboxes).map(([type, names]) =>
        names.map((name: string, index: number) => (
          <Chip
            key={`${type}-${index}`}
            color="secondary"
            label={getGeneralTagName(name)}
            onDelete={() => removeCheckboxTag(type as SearchParameterName, name as string)}
          />
        )),
      )}
    </Stack>
  );
};
