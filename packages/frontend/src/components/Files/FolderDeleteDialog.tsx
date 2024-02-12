import { useState } from 'react';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { Box, Typography } from '@mui/material';
import { ButtonWrapper } from '../../styles/common';
import { Modal } from '../Modal/Modal';
import { Colors } from '../../constants/Colors';
import { AxiosResponse } from 'axios';
import { StaticFileCard } from './StaticFileCard';
import { TNode } from '../../types/types';
import { deleteFolder } from '../../services/FolderDeleteService';
import { getErrorMessage } from '../../utils/errorUtil';

export interface FolderDeleteResponse {
  response: AxiosResponse;
  node: TNode;
}

interface FolderDeleteProps {
  categoryName: string;
  node: TNode;
  onClose: (event?: Event) => void;
  onDelete: (result: FolderDeleteResponse) => any;
  open: boolean;
}

export const FolderDeleteDialog = ({ categoryName, node, open, onClose, onDelete }: FolderDeleteProps) => {
  const { t } = useTranslation(['common']);

  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    onClose();
  };

  const handleFolderDelete = async () => {
    setIsLoading(true);
    if (node) {
      await deleteFolder(categoryName, node.entry.id)
        .then((result) => {
          setIsLoading(false);
          handleClose();
          setError(false);
          setSuccess(true);
          const res = {
            response: result,
            node: node,
          };
          onDelete(res);
          return result;
        })
        .catch((error) => {
          setIsLoading(false);
          setSuccess(false);
          setError(true);
          setErrorMessage(getErrorMessage(error));
        });
    } else {
    }
  };

  const handleSnackbarClose = () => {
    setError(false);
    setSuccess(false);
  };

  return (
    <Modal
      open={open}
      onSnackbarClose={handleSnackbarClose}
      handleClose={handleClose}
      title={t('common:folder.delete_folder')}
      error={error}
      success={success}
      errorMessage={errorMessage || t('common:folder.folder_not_deleted')}
      successMessage={t('common:folder.folder_deleted')}
      children={
        <Box>
          <Typography>{`${t('common:folder.folder_delete_confirmation')}?`}</Typography>
          <StaticFileCard node={node}></StaticFileCard>

          <Box sx={{ display: 'flex' }}>
            <ButtonWrapper sx={{ marginLeft: 'auto' }} color="primary" variant="text" onClick={() => handleClose()}>
              {t('common:action.cancel')}
            </ButtonWrapper>
            <ButtonWrapper
              color="error"
              variant="contained"
              disabled={isLoading}
              onClick={() => handleFolderDelete()}
              startIcon={
                isLoading ? (
                  <CircularProgress sx={{ color: Colors.darkgrey }} size="16px"></CircularProgress>
                ) : (
                  <DeleteOutlineOutlinedIcon></DeleteOutlineOutlinedIcon>
                )
              }
            >
              {t('common:action.delete')}
            </ButtonWrapper>
          </Box>
        </Box>
      }
    ></Modal>
  );
};
