import { Alert, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from 'react-i18next';

import { Tags } from '../../components/Tags';
import { ContainerWrapper } from '../Landing/index.styles';
import { NodeItem } from './NodeItem';
import { usePostAlfrescoSearch } from '../../hooks/query/Search';

export const SearchResult = () => {
  const { t } = useTranslation(['search', 'common']);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');

  const { isLoading, isError, error, data } = usePostAlfrescoSearch(query);

  if (isLoading) {
    return (
      <ContainerWrapper>
        <CircularProgress />;
      </ContainerWrapper>
    );
  }

  if (isError || data) {
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
