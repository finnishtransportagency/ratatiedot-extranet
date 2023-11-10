import { Pagination, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { Tags } from '../../components/Tags';
import { ProtectedContainerWrapper } from '../../styles/common';
import { NodeItem } from '../../components/Files/File';
import { useSearchParams } from 'react-router-dom';
import { ErrorMessage } from '../../components/Notification/ErrorMessage';
import { TNode } from '../../types/types';
import { useFileStore, useFiltersStore } from '../../components/Search/filterStore';
import { useEffect, useState } from 'react';
import { Spinner } from '../../components/Spinner';

export const SearchResult = () => {
  const { t } = useTranslation(['search', 'common']);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');

  const [pageNumber, setPageNumber] = useState(1);

  const page = useFiltersStore((state) => state.page);
  const updatePage = useFiltersStore((state) => state.updatePage);
  const search = useFileStore((state) => state.search);
  const error = useFileStore((state) => state.error);
  const data = useFileStore((state) => state.data);
  const isLoading = useFileStore((state) => state.isLoading);

  useEffect(() => {
    search();
  }, []);

  if (isLoading) return <Spinner />;

  if (!data) return <ErrorMessage title={`${t('search:search_results')} "${query}"`} error={error} />;

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
          page={pageNumber}
          showFirstButton
          showLastButton
          count={Math.ceil(data.list.pagination.totalItems / data.list.pagination.maxItems)}
          color="primary"
          onChange={(_: React.ChangeEvent<unknown>, value: number) => {
            setPageNumber(value);
            updatePage(value - 1);
            search();
          }}
        />
      ) : (
        <Typography variant="body1" sx={{ margin: '24px 0px' }}>
          {t('search:zero_result', { query: query })}
        </Typography>
      )}
    </ProtectedContainerWrapper>
  );
};
