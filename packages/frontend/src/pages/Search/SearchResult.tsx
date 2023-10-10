import { Pagination, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { Tags } from '../../components/Tags';
import { ProtectedContainerWrapper } from '../../styles/common';
import { NodeItem } from '../../components/Files/File';
import { useSearchParams } from 'react-router-dom';
import { ErrorMessage } from '../../components/Notification/ErrorMessage';
import { TNode } from '../../types/types';
import { useFileStore } from '../../components/Search/filterStore';
import { useEffect } from 'react';

export const SearchResult = () => {
  const { t } = useTranslation(['search', 'common']);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');

  const fetchFiles = useFileStore((state) => state.fetch);
  const { error, data: searchResult } = useFileStore((state) => ({ error: state.error, data: state.data }));

  useEffect(() => {
    fetchFiles();
  }, []);

  // if (isLoading) return <Spinner />;

  if (!searchResult) return <ErrorMessage title={`${t('search:search_results')} "${query}"`} error={error} />;

  return (
    <ProtectedContainerWrapper>
      <Typography variant="subtitle1">
        {t('search:search_results')} "{query}"
      </Typography>
      <Tags />
      <Typography variant="body1" sx={{ margin: '24px 0px' }}>
        {searchResult.list.pagination.totalItems} {t('search:results')}
      </Typography>
      <div style={{ marginLeft: '18px' }}>
        {searchResult.list.entries.map((node: TNode, index: number) => (
          <NodeItem key={index} row={index} node={node} isStatic={node.entry.isFile || node.entry.isFolder} />
        ))}
      </div>
      {searchResult.list.pagination.totalItems ? (
        <Pagination
          sx={{ justifyContent: 'center', display: 'flex' }}
          // page={page + 1}
          showFirstButton
          showLastButton
          count={Math.ceil(searchResult.list.pagination.totalItems / searchResult.list.pagination.maxItems)}
          color="primary"
          // onChange={(_: React.ChangeEvent<unknown>, pageNumber: number) => pageHandler(pageNumber - 1)}
        />
      ) : (
        <Typography variant="body1" sx={{ margin: '24px 0px' }}>
          {t('search:zero_result', { query: query })}
        </Typography>
      )}
    </ProtectedContainerWrapper>
  );
};
