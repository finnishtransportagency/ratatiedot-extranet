import { Box, ButtonProps } from '@mui/material';
import { t } from 'i18next';
import { FunctionComponent, useState } from 'react';
import { FileUploadDialog } from '../../components/Files/FileUploadDialog';
import { ButtonWrapper } from '../../styles/common';

interface DialogButtonProps {
  categoryName: string;
  buttonProps?: ButtonProps;
}

export const FileUploadDialogButton: FunctionComponent<DialogButtonProps> = ({ buttonProps, categoryName }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box>
      <ButtonWrapper {...buttonProps} onClick={handleOpen}>
        {t('common:file.add_file')}
      </ButtonWrapper>
      <FileUploadDialog onClose={handleClose} open={open} categoryName={categoryName}></FileUploadDialog>
    </Box>
  );
};
