import { Alert, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from 'react-i18next';

import { Tags } from '../../components/Tags';
import { ContainerWrapper } from '../Landing/index.styles';
import { NodeItem } from './NodeItem';
import { usePostAlfrescoSearch } from '../../hooks/query/Search';
import { useContext } from 'react';
import { SearchContext } from '../../contexts/SearchContext';
import { formatYear } from '../../utils/helpers';
import { useSearchParams } from 'react-router-dom';

export const SearchResult = () => {
  const { t } = useTranslation(['search', 'common']);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');
  const searchContext = useContext(SearchContext);
  const { years, checkedList } = searchContext;
  const searchParameter = {
    term: query,
    from: formatYear(years[0]),
    to: formatYear(years[1]),
    fileTypes: checkedList.mime,
  };

  const { isLoading, isError, error, data } = usePostAlfrescoSearch(searchParameter);

  if (isLoading) {
    return (
      <ContainerWrapper>
        <CircularProgress />
      </ContainerWrapper>
    );
  }

  if (isError) {
    return (
      <ContainerWrapper>
        <Alert severity="error">{error?.message || t('common:error.500')}</Alert>
      </ContainerWrapper>
    );
  }

  return (
    <ContainerWrapper>
      <Typography variant="subtitle1">
        {t('search:search_results')} "{query}"
      </Typography>
      <Tags />
      <Typography variant="body1" sx={{ margin: '24px 0px' }}>
        {data.list.pagination.totalItems} {t('search:results')}
      </Typography>
      <div style={{ marginLeft: '18px' }}>
        {data.list.entries.map((node: any, index: number) => (
          <NodeItem key={index} row={index} node={node} />
        ))}
      </div>
    </ContainerWrapper>
  );
};
