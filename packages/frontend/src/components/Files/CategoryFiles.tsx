import { NodeItem } from './File';
import { getRouteName, getRouterName } from '../../utils/helpers';
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
import { FileDeleteDialogButton } from './FileDeleteDialogButton';
import { useLocation } from 'react-router-dom';

type TCategoryFilesProps = {
  categoryName: string;
};

export const CategoryFiles = ({ categoryName }: TCategoryFilesProps) => {
  const { t } = useTranslation(['common', 'search']);
  const location = useLocation();
  const [fileList, setFileList] = useState<TNode[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [totalFiles, setTotalFiles] = useState(0);
  const [hasMoreItems, setHasMoreItems] = useState(false);
  const [selectedFile, setSelectedFile] = useState<TNode | undefined>(undefined);

  const getCategoryFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3002/api/alfresco/files?category=${getRouterName(categoryName)}&page=${page}`,
      );
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

  const handleNodeClick = (node: TNode) => {
    if (selectedFile?.entry.id === node.entry.id) {
      setSelectedFile(undefined);
    } else {
      setSelectedFile(node);
    }
  };

  const isSelected = (node: TNode) => {
    return selectedFile?.entry.id === node.entry.id;
  };

  if (error) return <ErrorMessage error={error} />;

  return (
    <>
      <FileDeleteDialogButton
        categoryName={getRouteName(location)}
        disabled={!selectedFile}
        node={selectedFile}
        onDelete={(e) => {
          console.log(e);
        }}
      ></FileDeleteDialogButton>

      {fileList.map((node: TNode, index: number) => (
        <NodeItem
          onFileClick={(node) => handleNodeClick(node)}
          key={index}
          row={index}
          node={node}
          isSelected={isSelected(node)}
        />
      ))}
      {loading && <Spinner />}
      <Typography sx={{ color: Colors.darkgrey }}>
        {t('search:show_results', { files: fileList.length, total: totalFiles })}
      </Typography>
      {hasMoreItems && (
        <ButtonWrapper color="primary" variant="outlined" onClick={loadMore}>
          {t('common:action.load_more')}
        </ButtonWrapper>
      )}
    </>
  );
};
