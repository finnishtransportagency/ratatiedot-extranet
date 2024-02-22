import { Button, ButtonProps } from '@mui/material';
import { t } from 'i18next';
import { FunctionComponent, useState } from 'react';

import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';

import { TNode } from '../../types/types';
import { FileMoveResponse } from './FileMoveDialog';
import { FileMoveDialog } from './FileMoveDialog';

interface DialogButtonProps {
  categoryName: string;
  node: TNode | null;
  buttonProps?: ButtonProps;
  onMove: (response: FileMoveResponse) => any;
  disabled?: boolean;
}

export const MoveDialogButton: FunctionComponent<DialogButtonProps> = ({
  categoryName,
  buttonProps,
  node,
  onMove,
  disabled,
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleMove = (result: FileMoveResponse) => {
    onMove(result);
  };

  return (
    <>
      <Button
        disabled={disabled}
        variant="outlined"
        color="primary"
        startIcon={<DriveFileMoveIcon />}
        {...buttonProps}
        onClick={handleOpen}
      >
        {t('common:action.move_selected')}
      </Button>

      <FileMoveDialog
        categoryName={categoryName}
        onClose={handleClose}
        onMove={handleMove}
        open={open}
        node={node}
      ></FileMoveDialog>
    </>
  );
};
