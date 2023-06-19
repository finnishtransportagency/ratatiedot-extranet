import { Button, ButtonProps } from '@mui/material';
import { AxiosResponse } from 'axios';
import { t } from 'i18next';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { FunctionComponent, useState } from 'react';

import { FileUploadDialog } from '../../components/Files/FileUploadDialog';

interface DialogButtonProps {
  categoryName: string;
  nestedFolderId?: string;
  buttonProps?: ButtonProps;
  onUpload?: (response: AxiosResponse) => any;
}

export const FileUploadDialogButton: FunctionComponent<DialogButtonProps> = ({
  buttonProps,
  categoryName,
  nestedFolderId,
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
    <>
      <Button variant="outlined" startIcon={<UploadFileIcon />} {...buttonProps} onClick={handleOpen}>
        {t('common:file.add_file')}
      </Button>
      <FileUploadDialog
        onClose={handleClose}
        onUpload={handleUpload}
        open={open}
        categoryName={categoryName}
        nestedFolderId={nestedFolderId}
      ></FileUploadDialog>
    </>
  );
};
