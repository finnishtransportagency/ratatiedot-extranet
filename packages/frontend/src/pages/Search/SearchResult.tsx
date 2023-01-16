import { Alert, Pagination, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from 'react-i18next';

import { Tags } from '../../components/Tags';
import { ContainerWrapper } from '../Landing/index.styles';
import { NodeItem } from './NodeItem';
import { TAlfrescoSearchProps, usePostAlfrescoSearch } from '../../hooks/query/Search';
import { useContext } from 'react';
import { SearchContext, SortingParameters } from '../../contexts/SearchContext';
import { formatYear } from '../../utils/helpers';
import { useSearchParams } from 'react-router-dom';
import { mimeNamesMapping } from '../../constants/Data';

export const SearchResult = () => {
  const { t } = useTranslation(['search', 'common']);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');
  const searchContext = useContext(SearchContext);
  const { years, savedCheckboxes, page, pageHandler, sort = [] } = searchContext;
  const searchParameter: TAlfrescoSearchProps = {
    term: query,
    from: formatYear(years[0]),
    to: formatYear(years[1]),
    fileTypes: savedCheckboxes.mime.map(
      (mimeType: string) => mimeNamesMapping[mimeType as keyof typeof mimeNamesMapping],
    ),
    // TODO: multiple ainestoluokka/category
    categoryName: savedCheckboxes.category[0],
    page: page,
    sort: sort as SortingParameters,
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
        <Typography variant="subtitle1">
          {t('search:search_results')} "{query}"
        </Typography>
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
      {data.list.pagination.totalItems && (
        <Pagination
          sx={{ justifyContent: 'center', display: 'flex' }}
          page={page + 1}
          showFirstButton
          showLastButton
          count={Math.ceil(data.list.pagination.totalItems / data.list.pagination.maxItems)}
          color="primary"
          onChange={(_: React.ChangeEvent<unknown>, pageNumber: number) => pageHandler(pageNumber - 1)}
        />
      )}
    </ContainerWrapper>
  );
};
