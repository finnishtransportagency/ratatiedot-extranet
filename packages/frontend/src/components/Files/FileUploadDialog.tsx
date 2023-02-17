import { Box, Typography } from '@mui/material';
import { FileModal } from '../Modal/FileModal';
import { FileInput } from '../FormInput/FileInput';
import { useTranslation } from 'react-i18next';
import { ButtonWrapper } from '../../styles/common';
import { useEffect, useState } from 'react';

interface FileUploadProps {
  categoryName: string;
}

const uploadFile = async () => {
  // await fetch('/', {
  //   method: 'POST',
  // });
};

export const FileUploadDialog = ({ categoryName }: FileUploadProps) => {
  const { t } = useTranslation(['common']);
  const [childData, setChildData] = useState<any>({ target: { value: '' } });
  const [dialogPhase, setPhase] = useState<string>('select-file');
  useEffect(() => console.log(childData.target.value), [childData]);
  switch (dialogPhase) {
    case 'select-file':
      return (
        <FileModal
          open={true}
          title={t('common:file.add_file')}
          children={
            <Box component="form">
              <Typography aria-describedby="modal-modal-description" variant="body1" sx={{ marginBottom: '12px' }}>
                {t('common:file.select_file_title')}
              </Typography>
              <FileInput passChildData={setChildData}></FileInput>
              <Box sx={{ display: 'flex' }}>
                <ButtonWrapper sx={{ marginLeft: 'auto' }} color="primary" variant="text" onClick={uploadFile}>
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
          open={true}
          title={t('common:file.add_file')}
          children={
            <Box component="form">
              <Typography>{childData.target.value}</Typography>
              <Box sx={{ display: 'flex' }}>
                <ButtonWrapper
                  sx={{ marginLeft: 'auto' }}
                  color="primary"
                  variant="text"
                  onClick={() => setPhase('select-file')}
                >
                  {t('common:action.back')}
                </ButtonWrapper>
                <ButtonWrapper color="primary" variant="contained" onClick={uploadFile}>
                  {t('common:action.next')}
                </ButtonWrapper>
              </Box>
            </Box>
          }
        ></FileModal>
      );
    default:
      return <Typography>File uploaded!</Typography>;
  }
};
