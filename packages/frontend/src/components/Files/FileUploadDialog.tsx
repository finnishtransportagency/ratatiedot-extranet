import { useState } from 'react';
import { CircularProgress } from '@mui/material';
import { format } from 'date-fns';
import prettyBytes from 'pretty-bytes';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/CheckSharp';
import { Box, Collapse, IconButton, TextField, Typography } from '@mui/material';

import { LocaleLang } from '../../constants/Units';
import { DateFormat } from '../../constants/Formats';
import { uploadFile } from '../../services/FileUploadService';
import { ButtonWrapper } from '../../styles/common';
import { getLocaleByteUnit, getRouterName } from '../../utils/helpers';
import { FileInput } from '../FileInput/FileInput';
import { Modal } from '../Modal/Modal';
import { Colors } from '../../constants/Colors';
import './styles.css';
import { AxiosResponse } from 'axios';
import { getErrorMessage } from '../../utils/errorUtil';

interface FileUploadProps {
  categoryName: string;
  nestedFolderId?: string;
  onClose: (event?: Event) => void;
  onUpload: (result: AxiosResponse) => any;
  open: boolean;
}

export const FileUploadDialog = ({ categoryName, nestedFolderId, open, onClose, onUpload }: FileUploadProps) => {
  const { t } = useTranslation(['common']);

  const [file, setFile] = useState<File>();
  const [name, setName] = useState<string>('');
  // TODO: Add title
  const [description, setDescription] = useState<string>('');
  const [dialogPhase, setPhase] = useState<number>(1);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleClose = () => {
    onClose();
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    await uploadFile(file, {
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

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const selectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    const selectedFiles = files as FileList;
    setFile(selectedFiles?.[0]);
    setName(selectedFiles?.[0].name);
  };

  switch (dialogPhase) {
    case 1:
      return (
        <Modal
          open={open}
          onSnackbarClose={handleSnackbarClose}
          handleClose={handleClose}
          errorMessage={errorMessage || t('common:file.file_not_uploaded')}
          successMessage={t('common:file.file_uploaded')}
          title={t('common:file.add_file')}
          children={
            <Box component="form">
              <Typography aria-describedby="modal-modal-description" variant="body1" sx={{ marginBottom: '12px' }}>
                {t('common:file.select_file_title')}
              </Typography>
              <FileInput passFileData={selectFile}></FileInput>
              <Box sx={{ display: 'flex' }}>
                <ButtonWrapper sx={{ marginLeft: 'auto' }} color="primary" variant="text" onClick={() => handleClose()}>
                  {t('common:action.cancel')}
                </ButtonWrapper>
                <ButtonWrapper color="primary" variant="contained" onClick={() => setPhase(2)}>
                  {t('common:action.next')}
                </ButtonWrapper>
              </Box>
            </Box>
          }
        ></Modal>
      );
    case 2:
      return (
        <Modal
          open={open}
          onSnackbarClose={handleSnackbarClose}
          handleClose={handleClose}
          title={t('common:file.add_file')}
          error={error}
          errorMessage={errorMessage || t('common:file.file_not_uploaded')}
          successMessage={t('common:file.file_uploaded')}
          success={success}
          children={
            <Box component="form">
              {file ? (
                <div className="additional-form">
                  <div>
                    <Typography>{file.name}</Typography>
                    <Box sx={{ display: 'flex' }}>
                      <Typography style={{ color: 'grey' }}>
                        {format(new Date(file.lastModified), DateFormat)}
                      </Typography>
                      <Typography style={{ color: 'grey', marginLeft: '8px' }}>
                        {getLocaleByteUnit(prettyBytes(file.size, { locale: 'fi' }), LocaleLang.FI)}
                      </Typography>
                    </Box>
                  </div>
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
                    <Typography variant="body1">{t('common:file.name')}</Typography>
                    <TextField
                      sx={{ margin: '4px 0 26px 0' }}
                      fullWidth
                      defaultValue={file.name}
                      onChange={(e) => setName(e.target.value)}
                    ></TextField>
                    <Typography variant="body1">{t('common:file.description')}</Typography>
                    <TextField
                      sx={{ margin: '4px 0 0 0' }}
                      className="form-text-field"
                      onChange={(e) => setDescription(e.target.value)}
                      fullWidth
                    ></TextField>
                  </Collapse>
                </div>
              ) : (
                t('common:file.file_not_selected')
              )}
              <Box sx={{ display: 'flex' }}>
                <ButtonWrapper sx={{ marginLeft: 'auto' }} color="primary" variant="text" onClick={() => setPhase(1)}>
                  {t('common:action.back')}
                </ButtonWrapper>
                <ButtonWrapper
                  color="primary"
                  variant="contained"
                  disabled={isLoading}
                  onClick={() => handleFileUpload(file as File)}
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
    default:
      return <div></div>;
  }
};
