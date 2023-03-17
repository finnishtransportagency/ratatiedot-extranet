import { useState } from 'react';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { Box, Typography } from '@mui/material';

import { deleteFile } from '../../services/FileDeleteService';
import { ButtonWrapper } from '../../styles/common';

import { FileModal } from '../Modal/FileModal';

import { Colors } from '../../constants/Colors';
import { AxiosResponse } from 'axios';
import { StaticFileCard } from './StaticFileCard';
import { TNode } from '../../types/types';

interface FileDeleteProps {
  categoryName: string;
  node?: TNode | undefined;
  onClose: (event?: Event) => void;
  onDelete: (result: AxiosResponse) => any;
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
          onDelete(result);
          return result;
        })
        .catch((error) => {
          setIsLoading(false);
          setSuccess(false);
          setError(true);
        });
    }
  };

  const handleSnackbarClose = () => {
    setError(false);
    setSuccess(false);
  };

  return (
    <FileModal
      open={open}
      onSnackbarClose={handleSnackbarClose}
      handleClose={handleClose}
      title={t('common:file.delete_file')}
      error={error}
      success={success}
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
    ></FileModal>
  );
};
