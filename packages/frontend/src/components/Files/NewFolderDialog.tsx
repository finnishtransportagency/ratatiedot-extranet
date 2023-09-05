import { useState } from 'react';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CheckIcon from '@mui/icons-material/CheckSharp';
import { Box, TextField, Typography } from '@mui/material';
import { ButtonWrapper } from '../../styles/common';
import { getRouterName } from '../../utils/helpers';
import { Modal } from '../Modal/Modal';
import { Colors } from '../../constants/Colors';
import './styles.css';
import { AxiosResponse } from 'axios';
import { createEmptyFolder } from '../../services/FolderUploadService';
import { getErrorMessage } from '../../utils/errorUtil';

interface FolderUploadProps {
  categoryName: string;
  nestedFolderId?: string;
  onClose: (event?: Event) => void;
  onUpload: (result: AxiosResponse) => any;
  open: boolean;
}

export const NewFolderDialog = ({ categoryName, nestedFolderId, open, onClose, onUpload }: FolderUploadProps) => {
  const { t } = useTranslation(['common']);
  const [name, setName] = useState<string>('');
  // TODO: Add title
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleClose = () => {
    onClose();
  };

  const handleCreateEmptyFolder = async () => {
    setIsLoading(true);
    await createEmptyFolder({
      name,
      description,
      categoryName: getRouterName(categoryName),
      nestedFolderId: nestedFolderId,
    })
      .then((result) => {
        setIsLoading(false);
        handleClose();
        setError(false);
        setSuccess(true);
        onUpload(result);
        return result;
      })
      .catch((error) => {
        setIsLoading(false);
        setSuccess(false);
        setError(true);
        setErrorMessage(getErrorMessage(error));
      });
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
      title={t('common:folder.add_folder')}
      error={error}
      errorMessage={errorMessage || t('common:folder.folder_not_uploaded')}
      successMessage={t('common:folder.folder_uploaded')}
      success={success}
      children={
        <Box component="form">
          <div className="additional-form">
            <Typography variant="body1">{t('common:folder.name')}</Typography>
            <TextField sx={{ margin: '4px 0 26px 0' }} fullWidth onChange={(e) => setName(e.target.value)}></TextField>
            <Typography variant="body1">{t('common:folder.description')}</Typography>
            <TextField
              sx={{ margin: '4px 0 0 0' }}
              className="form-text-field"
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
            ></TextField>
          </div>
          <Box sx={{ display: 'flex' }}>
            <ButtonWrapper sx={{ marginLeft: 'auto' }} color="primary" variant="text" onClick={handleClose}>
              {t('common:action.back')}
            </ButtonWrapper>
            <ButtonWrapper
              color="primary"
              variant="contained"
              disabled={isLoading}
              onClick={() => handleCreateEmptyFolder()}
              startIcon={
                isLoading ? (
                  <CircularProgress sx={{ color: Colors.darkgrey }} size="16px"></CircularProgress>
                ) : (
                  <CheckIcon></CheckIcon>
                )
              }
            >
              {t('common:action.add')}
            </ButtonWrapper>
          </Box>
        </Box>
      }
    ></Modal>
  );
};
