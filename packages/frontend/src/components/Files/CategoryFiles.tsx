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
import axios, { AxiosResponse } from 'axios';
import { DeleteDialogButton } from './DeleteDialogButton';
import { useLocation } from 'react-router-dom';
import { AppBarContext } from '../../contexts/AppBarContext';
import { getCategoryRouteName } from '../../routes';
import { MenuContext } from '../../contexts/MenuContext';
import { CategoryDataContext } from '../../contexts/CategoryDataContext';
import { UploadDialogButton } from './UploadDialogButton';
import styled from '@emotion/styled';
import { FileEditDialogButton } from './FileEditDialogButton';
import { MoveDialogButton } from './MoveDialogButton';
import { useStore } from './RefreshKeyStore';
type TCategoryFilesProps = {
  childFolderName?: string;
  nestedFolderId?: string;
};

export const CategoryFiles = ({ childFolderName, nestedFolderId }: TCategoryFilesProps) => {
  const initialFileList: TNode[] = [];
  const initialTotalFiles = 0;
  const initialHasMoreItems = false;
  const initialLoading = false;
  const initialError = null;

  const { t } = useTranslation(['common', 'search']);
  const location = useLocation();
  const [fileList, setFileList] = useState<TNode[]>(initialFileList);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState(initialError);
  const [totalFiles, setTotalFiles] = useState(initialTotalFiles);
  const [hasMoreItems, setHasMoreItems] = useState(initialHasMoreItems);
  const [selectedFile, setSelectedFile] = useState<TNode | null>(null);
  const categoryName = getCategoryRouteName(location);

  const { refreshKey, incrementRefreshKey } = useStore();

  const { openEdit, openToolbar } = useContext(AppBarContext);
  const { fileUploadDisabled, fileUploadDisabledHandler } = useContext(MenuContext);
  const { hasConfidentialContentHandler, hasClassifiedContentHandler, hasClassifiedContent } =
    useContext(CategoryDataContext);

  const resetState = () => {
    setFileList(initialFileList);
    setTotalFiles(initialTotalFiles);
    setHasMoreItems(initialHasMoreItems);
    setLoading(initialLoading);
    setError(initialError);
  };

  const isEditOpen = openEdit || openToolbar;

  const getCategoryFiles = useCallback(async () => {
    try {
      setLoading(true);
      const childFolderNameQuery = childFolderName ? `&childFolderName=${childFolderName}` : '';
      const nestedFolderIdQuery = nestedFolderId ? `&nestedFolderId=${nestedFolderId}` : '';
      const response = await axios.get(
        `/api/alfresco/files?category=${categoryName}${childFolderNameQuery}${nestedFolderIdQuery}&page=${page}`,
      );
      const { data, hasClassifiedContent, hasConfidentialContent } = response.data;
      const totalFiles = get(data, 'list.entries', []);
      const totalItems = get(data, 'list.pagination.totalItems', 0);
      const hasMoreItems = get(data, 'list.pagination.hasMoreItems', false);

      fileUploadDisabledHandler(hasClassifiedContent);
      hasClassifiedContentHandler(hasClassifiedContent);
      hasConfidentialContentHandler(hasConfidentialContent);

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
  }, [categoryName, page, refreshKey]);

  useEffect(() => {
    resetState();
    getCategoryFiles();
  }, [page, refreshKey]);

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

  const addFile = (node: TNode) => {
    if (fileExists(node.entry.name)) {
      deleteFile(node);
    }
    setFileList((currentFileList) => [...currentFileList, node]);
    setTotalFiles((currentTotalFiles) => currentTotalFiles + 1);
  };

  const updateFile = (editedNode: TNode) => {
    setFileList((currentFileList) => {
      const updatedList = currentFileList.map((node) => {
        if (node.entry.id === editedNode.entry.id) {
          return editedNode;
        }
        return node;
      });
      return updatedList;
    });
  };

  const fileExists = (fileName: string): boolean => {
    return fileList.some((file) => file.entry.name === fileName);
  };

  if (error) return <ErrorMessage error={error} />;

  return (
    <ProtectedContainerWrapper>
      <GroupedFileButtonsWrapper>
        {isEditOpen && !fileUploadDisabled && (
          <UploadDialogButton
            fileExists={fileExists}
            categoryName={categoryName}
            nestedFolderId={nestedFolderId}
            onUpload={(response: AxiosResponse) => {
              const node = response.data.body || response.data;
              addFile(node);
            }}
          />
        )}
        {isEditOpen && !fileUploadDisabled && (
          <FileEditDialogButton
            categoryName={categoryName}
            disabled={!selectedFile}
            node={selectedFile}
            onUpload={(response: AxiosResponse) => {
              const node = response.data;
              updateFile(node);
            }}
          />
        )}
        {isEditOpen && !hasClassifiedContent && (
          <DeleteDialogButton
            categoryName={categoryName}
            disabled={!selectedFile}
            node={selectedFile}
            onDelete={(e) => {
              deleteFile(e.node);
            }}
          ></DeleteDialogButton>
        )}
        {isEditOpen && !hasClassifiedContent && (
          <MoveDialogButton
            categoryName={categoryName}
            disabled={!selectedFile}
            node={selectedFile}
            onMove={(e) => {
              incrementRefreshKey();
            }}
          ></MoveDialogButton>
        )}
      </GroupedFileButtonsWrapper>

      {fileList.map((node: TNode, index: number) => (
        <NodeItem
          onFileClick={(node) => {
            handleNodeClick(node);
          }}
          key={index}
          row={index}
          node={node}
          isSelected={isSelected(node)}
          isStatic={node.entry.isFile || node.entry.isFolder}
        />
      ))}
      {loading ? (
        <Spinner />
      ) : (
        <Typography sx={{ color: Colors.darkgrey }}>
          {t('search:show_results', { files: fileList.length, total: totalFiles })}
        </Typography>
      )}
      {hasMoreItems && (
        <ButtonWrapper color="primary" variant="outlined" onClick={loadMore}>
          {t('common:action.load_more')}
        </ButtonWrapper>
      )}
    </ProtectedContainerWrapper>
  );
};

const GroupedFileButtonsWrapper = styled('div')(() => ({
  display: 'flex',
  marginBottom: '30px',
  justifyContent: 'start',
  gap: '10px',
}));
