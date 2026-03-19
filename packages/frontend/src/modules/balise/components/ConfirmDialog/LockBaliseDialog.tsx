import React, { useState, useCallback, useEffect } from 'react';
import { Alert, Box, DialogContentText, TextField } from '@mui/material';
import { ConfirmDialog } from './ConfirmDialog';

export interface LockBaliseDialogProps {
  open: boolean;
  onConfirm: (lockReason: string) => void;
  onCancel: () => void;
  loading?: boolean;
  baliseId?: number;
  bulkCount?: number;
  alreadyLockedCount?: number;
}

export const LockBaliseDialog: React.FC<LockBaliseDialogProps> = ({
  open,
  onConfirm,
  onCancel,
  loading = false,
  baliseId,
  bulkCount,
  alreadyLockedCount = 0,
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

  // Determine title and message based on bulk or single mode
  const isBulk = bulkCount !== undefined && bulkCount > 0;
  const toLockCount = isBulk ? bulkCount - alreadyLockedCount : 1;
  const allAlreadyLocked = isBulk && toLockCount === 0;

  const title = allAlreadyLocked
    ? 'Kaikki baliisit jo lukittu'
    : isBulk
      ? `Lukitse ${toLockCount} baliisia`
      : `Lukitse baliisi${baliseId ? ` ${baliseId}` : ''}`;
  const message = isBulk ? `Anna syy baliisien lukitsemiselle.` : 'Anna syy baliisin lukitsemiselle.';

  // If all balises are already locked, show warning only
  if (allAlreadyLocked) {
    return (
      <ConfirmDialog
        open={open}
        title={title}
        message={
          <Box>
            <Alert severity="warning">Kaikki valitut baliisit ovat jo lukittuja.</Alert>
          </Box>
        }
        confirmText="Sulje"
        onConfirm={onCancel}
        onCancel={onCancel}
        hideCancel
      />
    );
  }

  return (
    <ConfirmDialog
      open={open}
      title={title}
      message={
        <Box>
          {isBulk && alreadyLockedCount > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {alreadyLockedCount} baliisia on jo lukittu ja ohitetaan.
            </Alert>
          )}
          <DialogContentText sx={{ mb: 2 }}>{message}</DialogContentText>
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
