import { Box, ButtonProps } from '@mui/material';
import { AxiosResponse } from 'axios';
import { t } from 'i18next';
import { FunctionComponent, useState } from 'react';
import { ButtonWrapper } from '../../styles/common';
import { TNode } from '../../types/types';
import { FileDeleteDialog } from './FileDeleteDialog';

interface DialogButtonProps {
  categoryName: string;
  node: TNode | undefined;
  buttonProps?: ButtonProps;
  onDelete: (response: AxiosResponse) => any;
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

  const handleDelete = (result: AxiosResponse) => {
    onDelete(result);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <ButtonWrapper disabled={disabled} sx={{ margin: '0px 0px 24px auto' }} {...buttonProps} onClick={handleOpen}>
        {t('common:file.delete_selected_file')}
      </ButtonWrapper>
      <FileDeleteDialog
        categoryName={categoryName}
        onClose={handleClose}
        onDelete={handleDelete}
        open={open}
        node={node}
      ></FileDeleteDialog>
    </Box>
  );
};
