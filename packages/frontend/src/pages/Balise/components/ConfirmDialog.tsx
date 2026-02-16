import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Vahvista',
  cancelText = 'Peruuta',
  confirmColor = 'primary',
  onConfirm,
  onCancel,
  disabled = false,
  loading = false,
}) => {
  return (
    <Dialog open={open} onClose={onCancel} PaperProps={{ sx: { minWidth: 400 } }}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {typeof message === 'string' ? <DialogContentText>{message}</DialogContentText> : message}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained" disabled={disabled || loading}>
          {loading && <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />}
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
