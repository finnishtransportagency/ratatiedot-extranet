import { useState } from 'react';
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
import { getLocaleByteUnit } from '../../utils/helpers';

import { FileInput } from '../FileInput/FileInput';
import { FileModal } from '../Modal/FileModal';

import './styles.css';

interface FileUploadProps {
  categoryName: string;
}

export const FileUploadDialog = ({ categoryName }: FileUploadProps) => {
  const { t } = useTranslation(['common']);

  const [file, setFile] = useState<File>();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [dialogPhase, setPhase] = useState<string>('select-file');
  const [expanded, setExpanded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(true);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const selectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    const selectedFiles = files as FileList;
    setFile(selectedFiles?.[0]);
  };

  switch (dialogPhase) {
    case 'select-file':
      return (
        <FileModal
          open={dialogOpen}
          title={t('common:file.add_file')}
          children={
            <Box component="form">
              <Typography aria-describedby="modal-modal-description" variant="body1" sx={{ marginBottom: '12px' }}>
                {t('common:file.select_file_title')}
              </Typography>
              <FileInput passFileData={selectFile}></FileInput>
              <Box sx={{ display: 'flex' }}>
                <ButtonWrapper
                  sx={{ marginLeft: 'auto' }}
                  color="primary"
                  variant="text"
                  onClick={() => setPhase('dialog-close')}
                >
                  {t('common:action.cancel')}
                </ButtonWrapper>
                <ButtonWrapper color="primary" variant="contained" onClick={() => setPhase('give-additional-data')}>
                  {t('common:action.next')}
                </ButtonWrapper>
              </Box>
            </Box>
          }
        ></FileModal>
      );

    case 'give-additional-data':
      return (
        <FileModal
          open={dialogOpen}
          title={t('common:file.add_file')}
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
                    <Typography variant="body1">Nimi</Typography>
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
                'File not selected '
              )}
              <Box sx={{ display: 'flex' }}>
                <ButtonWrapper
                  sx={{ marginLeft: 'auto' }}
                  color="primary"
                  variant="text"
                  onClick={() => setPhase('select-file')}
                >
                  {t('common:action.back')}
                </ButtonWrapper>
                <ButtonWrapper
                  color="primary"
                  variant="contained"
                  onClick={() =>
                    uploadFile(file as File, {
                      name: name,
                      description: description,
                      parentNode: categoryName.toLocaleLowerCase(),
                    })
                  }
                  startIcon={<CheckIcon></CheckIcon>}
                >
                  {t('common:action.add')}
                </ButtonWrapper>
              </Box>
            </Box>
          }
        ></FileModal>
      );
    default:
      setDialogOpen(false);
      return <div>todo</div>;
  }
};
