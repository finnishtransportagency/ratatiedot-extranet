import { Box, Button, ButtonProps } from '@mui/material';
import { t } from 'i18next';
import { FunctionComponent, useState } from 'react';
import { ButtonWrapper } from '../../styles/common';
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
    <Box sx={{ display: 'flex' }}>
      <Button disabled={disabled} sx={{ margin: '0px 0px 24px auto' }} {...buttonProps} onClick={handleOpen}>
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
    </Box>
  );
};
