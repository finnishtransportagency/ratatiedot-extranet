import { Button, ButtonProps } from '@mui/material';
import { AxiosResponse } from 'axios';
import { t } from 'i18next';
import { FunctionComponent, useState } from 'react';

import { Image } from '@mui/icons-material';
import NoticeDialog from './NoticeDialog';

interface DialogButtonProps {
  buttonProps?: ButtonProps;
  onUpload?: (response: AxiosResponse) => any;
}

export const NoticeDialogButton: FunctionComponent<DialogButtonProps> = ({ buttonProps, onUpload }) => {
  const [openNewFolderDialog, setOpenNewFolderDialog] = useState(false);

  const handleOpenNewFolderDialog = () => {
    setOpenNewFolderDialog(true);
  };
  const handleCloseNewFolderDialog = () => {
    setOpenNewFolderDialog(false);
  };

  const handleUpload = (result: AxiosResponse) => {
    if (onUpload) onUpload(result);
  };

  return (
    <>
      <Button
        variant="text"
        startIcon={<Image />}
        {...buttonProps}
        onClick={handleOpenNewFolderDialog}
        sx={{ minHeight: 0, m: 0, p: 0, top: 0 }}
      >
        {t('common:action.add_new')}
      </Button>
      <NoticeDialog
        onClose={handleCloseNewFolderDialog}
        onUpload={handleUpload}
        open={openNewFolderDialog}
      ></NoticeDialog>
    </>
  );
};
