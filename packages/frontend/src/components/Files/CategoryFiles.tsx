import { NodeItem } from './File';
import { getRouterName } from '../../utils/helpers';
import { ErrorMessage } from '../Notification/ErrorMessage';
import { Spinner } from '../Spinner';
import { useCallback, useEffect, useState } from 'react';
import { ButtonWrapper } from '../../styles/common';
import { get } from 'lodash';
import { useTranslation } from 'react-i18next';
import { TNode } from '../../types/types';
import { Typography } from '@mui/material';
import { Colors } from '../../constants/Colors';
import axios from 'axios';

type TCategoryFilesProps = {
  categoryName: string;
};

export const CategoryFiles = ({ categoryName }: TCategoryFilesProps) => {
  const { t } = useTranslation(['common', 'search']);
  const [fileList, setFileList] = useState<TNode[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [totalFiles, setTotalFiles] = useState(0);
  const [hasMoreItems, setHasMoreItems] = useState(false);

  const getCategoryFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/alfresco/files?category=${getRouterName(categoryName)}&page=${page}`);
      const data = response.data;
      const totalFiles = get(data, 'list.entries', []);
      const totalItems = get(data, 'list.pagination.totalItems', 0);
      const hasMoreItems = get(data, 'list.pagination.hasMoreItems', false);

      setFileList((f) => {
        return page > 0 ? [...f, ...totalFiles] : [...totalFiles];
      });
      setTotalFiles(totalItems);
      setHasMoreItems(hasMoreItems);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [categoryName, page]);

  useEffect(() => {
    setPage(0); // Reset page to 0 for saving file in development
    getCategoryFiles();
  }, []);

  useEffect(() => {
    getCategoryFiles();
  }, [page]);

  const loadMore = () => setPage(page + 1);

  if (error) return <ErrorMessage error={error} />;

  return (
    <>
      {fileList.map((node: TNode, index: number) => (
        <NodeItem key={index} row={index} node={node} />
      ))}
      {loading && <Spinner />}
      <Typography sx={{ color: Colors.darkgrey }}>
        {t('search:show_results', { files: fileList.length, total: totalFiles })}
      </Typography>
      {hasMoreItems && (
        <ButtonWrapper variant="contained" onClick={loadMore}>
          {t('common:action.load_more')}
        </ButtonWrapper>
      )}
    </>
  );
};
