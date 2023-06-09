import { Box, Button, ButtonProps } from '@mui/material';
import { t } from 'i18next';
import { FunctionComponent, useState } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';

import { TNode } from '../../types/types';
import { FileDeleteDialog, FileDeleteResponse } from './FileDeleteDialog';

interface DialogButtonProps {
  categoryName: string;
  node: TNode | null;
  buttonProps?: ButtonProps;
  onDelete: (response: FileDeleteResponse) => any;
  disabled?: boolean;
}

export const FileDeleteDialogButton: FunctionComponent<DialogButtonProps> = ({
  categoryName,
  buttonProps,
  node,
  onDelete,
  disabled,
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = (result: FileDeleteResponse) => {
    onDelete(result);
  };

  return (
    <>
      <Button disabled={disabled} variant="contained" startIcon={<DeleteIcon />} {...buttonProps} onClick={handleOpen}>
        {t('common:file.delete_selected_file')}
      </Button>
      {node ? (
        <FileDeleteDialog
          categoryName={categoryName}
          onClose={handleClose}
          onDelete={handleDelete}
          open={open}
          node={node}
        ></FileDeleteDialog>
      ) : (
        <></>
      )}
    </>
  );
};
