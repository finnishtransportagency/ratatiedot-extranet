import { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CheckIcon from '@mui/icons-material/CheckSharp';
import { Box, TextField, Typography } from '@mui/material';
import { ButtonWrapper } from '../../styles/common';
import { Modal } from '../Modal/Modal';
import { Colors } from '../../constants/Colors';
import './styles.css';
import { AxiosResponse } from 'axios';
import { getErrorMessage } from '../../utils/errorUtil';
import { updateNode } from '../../services/NodeEditService';
import { TNode } from '../../types/types';

interface NodeUpdateProps {
  node: TNode;
  categoryName: string;
  onClose: (event?: Event) => void;
  onUpload: (result: AxiosResponse) => any;
  open: boolean;
}

export const FileEditDialog = ({ node, categoryName, open, onClose, onUpload }: NodeUpdateProps) => {
  const { id, name: nodeName, properties, isFile } = node.entry;
  const { t } = useTranslation(['common']);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    setName(nodeName || '');
    setDescription(properties?.['cm:description'] || '');
    setTitle(properties?.['cm:title'] || '');
  }, [node]);

  const handleClose = () => {
    onClose();
  };

  const editNodeProperties = async () => {
    setIsLoading(true);
    await updateNode(id, categoryName, name, description, title)
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
      title={isFile ? t('common:file.edit_file') : t('common:folder.edit_folder')}
      error={error}
      errorMessage={errorMessage || isFile ? t('common:file.file_not_edited') : t('common:folder.folder_not_edited')}
      successMessage={isFile ? t('common:file.file_edited') : t('common:folder.folder_edited')}
      success={success}
      children={
        <Box component="form">
          <div className="additional-form">
            <Typography variant="body1">{t('common:folder.name')}</Typography>
            <TextField
              sx={{ margin: '4px 0 16px 0' }}
              fullWidth
              onChange={(e) => setName(e.target.value)}
              value={name}
            ></TextField>
            <Typography variant="body1">{t('common:folder.description')}</Typography>
            <TextField
              sx={{ margin: '4px 0 16px 0' }}
              className="form-text-field"
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              value={description}
            ></TextField>
            <Typography variant="body1">{t('common:folder.title')}</Typography>
            <TextField
              sx={{ margin: '4px 0 0 0' }}
              className="form-text-field"
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              value={title}
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
              onClick={() => editNodeProperties()}
              startIcon={
                isLoading ? (
                  <CircularProgress sx={{ color: Colors.darkgrey }} size="16px"></CircularProgress>
                ) : (
                  <CheckIcon></CheckIcon>
                )
              }
            >
              {t('common:action.save')}
            </ButtonWrapper>
          </Box>
        </Box>
      }
    ></Modal>
  );
};
