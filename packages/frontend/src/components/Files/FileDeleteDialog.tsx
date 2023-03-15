import { useState } from 'react';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/CheckSharp';
import { Box, Collapse, IconButton, Typography } from '@mui/material';

import { deleteFiles } from '../../services/FileDeleteService';
import { ButtonWrapper } from '../../styles/common';

import { FileModal } from '../Modal/FileModal';

import { Colors } from '../../constants/Colors';
import './styles.css';
import { AxiosResponse } from 'axios';

interface FileUploadProps {
  categoryName: string;
  nodeIds: string[];
  onClose: (event?: Event) => void;
  onDelete: (result: AxiosResponse[]) => any;
  open: boolean;
  multiple: boolean;
}

export const FileDeleteDialog = ({ categoryName, nodeIds, open, onClose, onDelete, multiple }: FileUploadProps) => {
  const { t } = useTranslation(['common']);

  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    onClose();
  };

  const handleFileDelete = async () => {
    setIsLoading(true);
    await deleteFiles(categoryName, nodeIds)
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
  };

  const handleSnackbarClose = () => {
    setError(false);
    setSuccess(false);
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <FileModal
      open={open}
      onSnackbarClose={handleSnackbarClose}
      handleClose={handleClose}
      title={t('common:file.add_file')}
      error={error}
      success={success}
      children={
        <Box component="form">
          <div className="additional-form">
            <p>ASD</p>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body1" sx={{ textTransform: 'uppercase' }}>
                {t('common:file.more_actions')}
              </Typography>
              <IconButton
                className={`expand-button ${expanded ? 'active' : ''}`}
                edge="end"
                size="small"
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label={t('common:file.more_actions')}
              >
                <ExpandMoreIcon />
              </IconButton>
            </Box>
            <Collapse sx={{ width: '100%' }} in={expanded} timeout="auto" unmountOnExit>
              {nodeIds.map((nodeId: string) => (
                <p>{nodeId}</p>
              ))}
            </Collapse>
          </div>

          <Box sx={{ display: 'flex' }}>
            <ButtonWrapper sx={{ marginLeft: 'auto' }} color="primary" variant="text" onClick={() => handleClose()}>
              {t('common:action.cancel')}
            </ButtonWrapper>
            <ButtonWrapper
              color="primary"
              variant="contained"
              disabled={isLoading}
              onClick={() => handleFileDelete()}
              startIcon={
                isLoading ? (
                  <CircularProgress sx={{ color: Colors.darkgrey }} size="16px"></CircularProgress>
                ) : (
                  <CheckIcon></CheckIcon>
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
