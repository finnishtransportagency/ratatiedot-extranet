import { Chip, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useFiltersStore, useFileStore } from '../../components/Search/filterStore';
import { SortDataType } from '../../constants/Data';

export const Tags = () => {
  const { t } = useTranslation(['search']);

  const category = useFiltersStore((state) => state.category);
  const updateCategory = useFiltersStore((state) => state.updateCategory);
  const area = useFiltersStore((state) => state.area);
  const updateArea = useFiltersStore((state) => state.updateArea);
  const mimeTypes = useFiltersStore((state) => state.mimeTypes);
  const toggleMimeType = useFiltersStore((state) => state.toggleMimeType);
  const sort = useFiltersStore((state) => state.sort);
  const updateSort = useFiltersStore((state) => state.updateSort);
  const fromYear = useFiltersStore((state) => state.from?.getFullYear());
  const toYear = useFiltersStore((state) => state.to?.getFullYear());
  const resetTimespan = useFiltersStore((state) => state.resetTimespan);

  const search = useFileStore((state) => state.search);

  const getTimespanLabel = (): string => {
    return `${fromYear} - ${toYear}`;
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

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
      {sort?.field && (
        <Chip
          color="secondary"
          label={getSortingTagName(sort)}
          onDelete={() => {
            updateSort(SortDataType.NONE);
            search();
          }}
        />
      )}
      {fromYear && (
        <Chip
          color="secondary"
          label={getTimespanLabel()}
          onDelete={() => {
            resetTimespan();
            search();
          }}
        />
      )}
      {mimeTypes.map((mimeType) => {
        return (
          <Chip
            color="secondary"
            label={mimeType}
            onDelete={() => {
              toggleMimeType(mimeType);
              search();
            }}
          />
        );
      })}
      {category && (
        <Chip
          color="secondary"
          label={category.name}
          onDelete={() => {
            updateCategory(null);
            search();
          }}
        />
      )}
      {area && (
        <Chip
          color="secondary"
          label={area.title}
          onDelete={() => {
            updateArea(null);
            search();
          }}
        />
      )}
    </Stack>
  );
};
