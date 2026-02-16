import React, { useState, useCallback, useEffect } from 'react';
import { Box, DialogContentText, TextField } from '@mui/material';
import { ConfirmDialog } from './ConfirmDialog';

export interface LockBaliseDialogProps {
  open: boolean;
  onConfirm: (lockReason: string) => void;
  onCancel: () => void;
  loading?: boolean;
  baliseId?: number;
}

export const LockBaliseDialog: React.FC<LockBaliseDialogProps> = ({
  open,
  onConfirm,
  onCancel,
  loading = false,
  baliseId,
}) => {
  const [lockReason, setLockReason] = useState('');

  // Reset the reason when dialog opens
  useEffect(() => {
    if (open) {
      setLockReason('');
    }
  }, [open]);

  const handleConfirm = useCallback(() => {
    if (lockReason.trim()) {
      onConfirm(lockReason.trim());
    }
  }, [lockReason, onConfirm]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && lockReason.trim() && !loading) {
        e.preventDefault();
        handleConfirm();
      }
    },
    [handleConfirm, lockReason, loading],
  );

  const isValid = lockReason.trim().length > 0;

  return (
    <ConfirmDialog
      open={open}
      title={`Lukitse baliisi${baliseId ? ` ${baliseId}` : ''}`}
      message={
        <Box>
          <DialogContentText sx={{ mb: 2 }}>Anna syy balisin lukitsemiselle.</DialogContentText>
          <TextField
            label="Lukitsemisen syy"
            placeholder="Esim. Tietojen päivitys, korjaus, uusi versio..."
            fullWidth
            multiline
            rows={3}
            value={lockReason}
            onChange={(e) => setLockReason(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            required
            error={lockReason.length > 0 && !isValid}
            helperText={lockReason.length > 0 && !isValid ? 'Syy on pakollinen' : ''}
          />
        </Box>
      }
      confirmText="Lukitse"
      onConfirm={handleConfirm}
      onCancel={onCancel}
      disabled={!isValid}
      loading={loading}
    />
  );
};

export default LockBaliseDialog;
