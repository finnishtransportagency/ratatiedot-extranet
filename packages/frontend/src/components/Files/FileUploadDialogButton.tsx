import { Button, ButtonProps } from '@mui/material';
import { AxiosResponse } from 'axios';
import { t } from 'i18next';
import { FunctionComponent, useState } from 'react';
import { FileUploadDialog } from '../../components/Files/FileUploadDialog';
import { ProtectedContainerWrapper } from '../../styles/common';

interface DialogButtonProps {
  categoryName: string;
  buttonProps?: ButtonProps;
  onUpload?: (response: AxiosResponse) => any;
}

export const FileUploadDialogButton: FunctionComponent<DialogButtonProps> = ({
  buttonProps,
  categoryName,
  onUpload,
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleUpload = (result: AxiosResponse) => {
    if (onUpload) onUpload(result);
  };

  return (
    <ProtectedContainerWrapper>
      <Button sx={{ padding: 0 }} {...buttonProps} onClick={handleOpen}>
        {t('common:file.add_file')}
      </Button>
      <FileUploadDialog
        onClose={handleClose}
        onUpload={handleUpload}
        open={open}
        categoryName={categoryName}
      ></FileUploadDialog>
    </ProtectedContainerWrapper>
  );
};
