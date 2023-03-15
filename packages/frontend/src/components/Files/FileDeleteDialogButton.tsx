import { Box, ButtonProps } from '@mui/material';
import { AxiosResponse } from 'axios';
import { t } from 'i18next';
import { FunctionComponent, useState } from 'react';
import { ButtonWrapper } from '../../styles/common';
import { FileDeleteDialog } from './FileDeleteDialog';

interface DialogButtonProps {
  categoryName: string;
  nodeIds: string[];
  buttonProps?: ButtonProps;
  onDelete: (response: AxiosResponse[]) => any;
}

export const FileDeleteDialogButton: FunctionComponent<DialogButtonProps> = ({
  categoryName,
  buttonProps,
  nodeIds,
  onDelete,
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = (result: AxiosResponse[]) => {
    onDelete(result);
  };

  return (
    <Box>
      <ButtonWrapper {...buttonProps} onClick={handleOpen}>
        {t('common:file.delete_file')}
      </ButtonWrapper>
      <FileDeleteDialog
        categoryName={categoryName}
        multiple={nodeIds.length > 1}
        onClose={handleClose}
        onDelete={handleDelete}
        open={open}
        nodeIds={nodeIds}
      ></FileDeleteDialog>
    </Box>
  );
};
