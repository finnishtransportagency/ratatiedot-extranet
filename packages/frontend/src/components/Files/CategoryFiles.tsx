import { NodeItem } from './File';
import { ErrorMessage } from '../Notification/ErrorMessage';
import { Spinner } from '../Spinner';
import { useCallback, useContext, useEffect, useState } from 'react';
import { ButtonWrapper, ProtectedContainerWrapper } from '../../styles/common';
import { get } from 'lodash';
import { useTranslation } from 'react-i18next';
import { TNode } from '../../types/types';
import { Typography } from '@mui/material';
import { Colors } from '../../constants/Colors';
import axios from 'axios';
import { FileDeleteDialogButton } from './FileDeleteDialogButton';
import { useLocation } from 'react-router-dom';
import { AppBarContext } from '../../contexts/AppBarContext';
import { getCategoryRouteName } from '../../routes';
import { MenuContext } from '../../contexts/MenuContext';

type TCategoryFilesProps = {
  childFolderName?: string;
  nestedFolderId?: string;
};

export const CategoryFiles = ({ childFolderName, nestedFolderId }: TCategoryFilesProps) => {
  const { t } = useTranslation(['common', 'search']);
  const location = useLocation();
  const [fileList, setFileList] = useState<TNode[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [totalFiles, setTotalFiles] = useState(0);
  const [hasMoreItems, setHasMoreItems] = useState(false);
  const [selectedFile, setSelectedFile] = useState<TNode | null>(null);
  const categoryName = getCategoryRouteName(location);
  const [hasClassifiedContent, setHasClassifiedContent] = useState(true);

  const { openEdit, openToolbar } = useContext(AppBarContext);
  const { fileUploadDisabledHandler } = useContext(MenuContext);

  const isEditOpen = openEdit || openToolbar;

  const getCategoryFiles = useCallback(async () => {
    try {
      setLoading(true);
      const childFolderNameQuery = childFolderName ? `&childFolderName=${childFolderName}` : '';
      const nestedFolderIdQuery = nestedFolderId ? `&nestedFolderId=${nestedFolderId}` : '';
      const response = await axios.get(
        `/api/alfresco/files?category=${categoryName}${childFolderNameQuery}${nestedFolderIdQuery}&page=${page}`,
      );
      const { data, hasClassifiedContent } = response.data;
      const totalFiles = get(data, 'list.entries', []);
      const totalItems = get(data, 'list.pagination.totalItems', 0);
      const hasMoreItems = get(data, 'list.pagination.hasMoreItems', false);

      setHasClassifiedContent(hasClassifiedContent);
      fileUploadDisabledHandler(hasClassifiedContent);

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
      setSelectedFile(null);
    } else {
      setSelectedFile(node);
    }
  };

  const isSelected = (node: TNode) => {
    return selectedFile?.entry.id === node.entry.id;
  };

  const deleteFile = (node: TNode) => {
    const index = fileList.findIndex((f) => f.entry.id === node.entry.id);
    if (index > -1) {
      const newList = [...fileList];
      newList.splice(index, 1);
      setFileList(newList);
      setTotalFiles(totalFiles - 1);
    }
  };

  if (error) return <ErrorMessage error={error} />;

  return (
    <ProtectedContainerWrapper>
      {isEditOpen && !hasClassifiedContent && (
        <FileDeleteDialogButton
          categoryName={categoryName}
          disabled={!selectedFile}
          node={selectedFile}
          onDelete={(e) => {
            deleteFile(e.node);
          }}
        ></FileDeleteDialogButton>
      )}

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
    </ProtectedContainerWrapper>
  );
};
