import { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMoreOutlined';
import DriveFileMoveOutlined from '@mui/icons-material/DriveFileMoveOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRightOutlined';
import { Box, Typography } from '@mui/material';
import { ButtonWrapper } from '../../styles/common';
import { Modal } from '../Modal/Modal';
import { Colors } from '../../constants/Colors';
import { AxiosResponse } from 'axios';
import { StaticFileCard } from './StaticFileCard';
import { TNode } from '../../types/types';
import { getErrorMessage } from '../../utils/errorUtil';
import { TreeView, TreeItem } from '@mui/x-tree-view';
import { moveFile } from '../../services/FileMoveService';
import { getFolders } from '../../services/FolderListService';
import { parseRouterName } from '../../utils/helpers';

interface FileMoveProps {
  categoryName: string;
  node: TNode;
  onClose: (event?: Event) => void;
  onMove: (result: AxiosResponse) => any;
  open: boolean;
}

export const FileMoveDialog = ({ categoryName, node, open, onClose, onMove }: FileMoveProps) => {
  const { t } = useTranslation(['common']);

  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFolderListLoading, setIsFolderListLoading] = useState(false);
  const [folders, setFolders] = useState<TNode[]>([]);
  const [target, setTarget] = useState<string>('');

  const handleClose = () => {
    onClose();
  };

  const listFolders = async () => {
    try {
      setIsFolderListLoading(true);
      const resp = await getFolders(categoryName);
      // parse root node name to readable form
      resp.data.data[0].entry.name = parseRouterName(categoryName);
      setFolders(resp.data.data);
    } catch (err: any) {
      setIsFolderListLoading(false);
      setError(true);
    } finally {
      setIsFolderListLoading(false);
    }
  };

  useEffect(() => {
    listFolders();
  }, []);

  const handleFileMove = async () => {
    setIsLoading(true);
    if (target) {
      await moveFile(categoryName, node.entry.id, target)
        .then((result) => {
          setIsLoading(false);
          handleClose();
          setError(false);
          setSuccess(true);
          onMove(result);
          return result;
        })
        .catch((error) => {
          setIsLoading(false);
          setSuccess(false);
          setError(true);
          setErrorMessage(getErrorMessage(error));
        });
    }
  };

  const handleSnackbarClose = () => {
    setError(false);
    setSuccess(false);
  };

  const RenderTree = (node: TNode) => (
    <TreeItem key={node.entry.id} nodeId={node.entry.id} label={node.entry.name}>
      {Array.isArray(node.entry.children) ? node.entry.children.map((node: TNode) => <RenderTree {...node} />) : null}
    </TreeItem>
  );

  return (
    <Modal
      open={open}
      onSnackbarClose={handleSnackbarClose}
      handleClose={handleClose}
      title={t('common:moveDialog.moveNode', {
        nodeType: node?.entry.isFolder ? t('common:folder.folder') : t('common:file.file'),
      })}
      error={error}
      success={success}
      errorMessage={
        errorMessage || node?.entry.isFolder ? t('common:folder.folder_not_moved') : t('common:file.file_not_moved')
      }
      successMessage={node?.entry.isFolder ? t('common:folder.folder_moved') : t('common:file.file_moved')}
      children={
        <Box>
          <Typography>
            {t('common:moveDialog.nodeBeindMoved', {
              nodeType: node?.entry.isFolder ? t('common:folder.folder') : t('common:file.file'),
            })}
          </Typography>
          <StaticFileCard node={node}></StaticFileCard>

          <Typography>
            {t('common:moveDialog.chooseTarget', {
              nodeType: node?.entry.isFolder ? t('common:folder.folder') : t('common:file.file'),
            })}
          </Typography>
          {isFolderListLoading ? (
            <CircularProgress size="24px" />
          ) : (
            <TreeView
              aria-label="file system navigator"
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
              sx={{
                height: 240,
                flexGrow: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
              onNodeSelect={(_, nodeId) => {
                setTarget(nodeId);
              }}
            >
              {folders.map((folder) => (
                <RenderTree {...folder} />
              ))}
            </TreeView>
          )}

          <Box sx={{ display: 'flex' }}>
            <ButtonWrapper sx={{ marginLeft: 'auto' }} color="primary" variant="text" onClick={() => handleClose()}>
              {t('common:action.cancel')}
            </ButtonWrapper>
            <ButtonWrapper
              color="info"
              variant="contained"
              disabled={isLoading}
              onClick={() => handleFileMove()}
              startIcon={
                isLoading ? (
                  <CircularProgress sx={{ color: Colors.darkgrey }} size="16px"></CircularProgress>
                ) : (
                  <DriveFileMoveOutlined></DriveFileMoveOutlined>
                )
              }
            >
              {t('common:action.move')}
            </ButtonWrapper>
          </Box>
        </Box>
      }
    ></Modal>
  );
};
