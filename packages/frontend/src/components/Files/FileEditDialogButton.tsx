import { Button, ButtonProps } from '@mui/material';
import { AxiosResponse } from 'axios';
import { FunctionComponent, useState } from 'react';

import { FileEditDialog } from './FileEditDialog';
import { TNode } from '../../types/types';
import { EditOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface DialogButtonProps {
  categoryName: string;
  node: TNode | null;
  buttonProps?: ButtonProps;
  onUpload?: (response: AxiosResponse) => any;
  disabled?: boolean;
}

export const FileEditDialogButton: FunctionComponent<DialogButtonProps> = ({
  categoryName,
  node,
  onUpload,
  disabled,
}) => {
  const [openFileEditDialog, setOpenFileEditDialog] = useState(false);
  const { t } = useTranslation(['common']);
  const handleOpenFileEditDialog = () => {
    setOpenFileEditDialog(true);
  };
  const handleCloseFileEditDialog = () => {
    setOpenFileEditDialog(false);
  };

  const handleUpload = (result: AxiosResponse) => {
    if (onUpload) onUpload(result);
  };

  return (
    <>
      <Button variant="contained" disabled={disabled} startIcon={<EditOutlined />} onClick={handleOpenFileEditDialog}>
        {t('edit.edit')}
      </Button>
      {node?.entry ? (
        <FileEditDialog
          node={node}
          onClose={handleCloseFileEditDialog}
          onUpload={handleUpload}
          open={openFileEditDialog}
          categoryName={categoryName}
        ></FileEditDialog>
      ) : (
        <></>
      )}
    </>
  );
};
