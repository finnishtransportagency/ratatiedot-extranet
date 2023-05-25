import { useState } from 'react';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { Box, Typography } from '@mui/material';

import { deleteFile } from '../../services/FileDeleteService';
import { ButtonWrapper } from '../../styles/common';

import { Modal } from '../Modal/Modal';

import { Colors } from '../../constants/Colors';
import { AxiosResponse } from 'axios';
import { StaticFileCard } from './StaticFileCard';
import { TNode } from '../../types/types';

export interface FileDeleteResponse {
  response: AxiosResponse;
  node: TNode;
}

interface FileDeleteProps {
  categoryName: string;
  node: TNode;
  onClose: (event?: Event) => void;
  onDelete: (result: FileDeleteResponse) => any;
  open: boolean;
}

export const FileDeleteDialog = ({ categoryName, node, open, onClose, onDelete }: FileDeleteProps) => {
  const { t } = useTranslation(['common']);

  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    onClose();
  };

  const handleFileDelete = async () => {
    setIsLoading(true);
    if (node) {
      await deleteFile(categoryName, node.entry.id)
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
      title={t('common:file.delete_file')}
      error={error}
      success={success}
      errorMessage={t('common:file.files_not_deleted')}
      successMessage={t('common:file.files_deleted')}
      children={
        <Box>
          <Typography>{`${t('common:file.file_delete_confirmation')}?`}</Typography>
          <StaticFileCard node={node}></StaticFileCard>

          <Box sx={{ display: 'flex' }}>
            <ButtonWrapper sx={{ marginLeft: 'auto' }} color="primary" variant="text" onClick={() => handleClose()}>
              {t('common:action.cancel')}
            </ButtonWrapper>
            <ButtonWrapper
              color="error"
              variant="contained"
              disabled={isLoading}
              onClick={() => handleFileDelete()}
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
