import { Pagination, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { Tags } from '../../components/Tags';
import { ProtectedContainerWrapper } from '../../styles/common';
import { NodeItem } from '../../components/Files/File';
import { usePostAlfrescoSearch } from '../../hooks/query/Search';
import { useSearchParams } from 'react-router-dom';
import { Spinner } from '../../components/Spinner';
import { ErrorMessage } from '../../components/Notification/ErrorMessage';
import { TNode } from '../../types/types';
import { useFiltersStore } from '../../components/Search/filterStore';

export const SearchResult = () => {
  const { t } = useTranslation(['search', 'common']);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');

  const filters = useFiltersStore((state: any) => ({
    searchString: state.searchString,
    from: state.from,
    to: state.to,
    mimeTypes: state.mimeTypes,
    category: state.category,
    page: state.page,
    sort: state.sort,
    contentSearch: state.contentSearch,
    nameSearch: state.nameSearch,
    titleSearch: state.titleSearch,
    descriptionSearch: state.descriptionSearch,
  }));

  console.log('FILTERS', filters);

  const { isLoading, isError, error, data } = usePostAlfrescoSearch(filters);

  if (isLoading) return <Spinner />;

  if (isError) return <ErrorMessage title={`${t('search:search_results')} "${query}"`} error={error} />;

  return (
    <ProtectedContainerWrapper>
      <Typography variant="subtitle1">
        {t('search:search_results')} "{query}"
      </Typography>
      <Tags />
      <Typography variant="body1" sx={{ margin: '24px 0px' }}>
        {data.list.pagination.totalItems} {t('search:results')}
      </Typography>
      <div style={{ marginLeft: '18px' }}>
        {data.list.entries.map((node: TNode, index: number) => (
          <NodeItem key={index} row={index} node={node} isStatic={node.entry.isFile || node.entry.isFolder} />
        ))}
      </div>
      {data.list.pagination.totalItems ? (
        <Pagination
          sx={{ justifyContent: 'center', display: 'flex' }}
          page={page + 1}
          showFirstButton
          showLastButton
          count={Math.ceil(data.list.pagination.totalItems / data.list.pagination.maxItems)}
          color="primary"
          onChange={(_: React.ChangeEvent<unknown>, pageNumber: number) => pageHandler(pageNumber - 1)}
        />
      ) : (
        <Typography variant="body1" sx={{ margin: '24px 0px' }}>
          {t('search:zero_result', { query: query })}
        </Typography>
      )}
    </ProtectedContainerWrapper>
  );
};
