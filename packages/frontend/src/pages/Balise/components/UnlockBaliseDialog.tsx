import React from 'react';
import { Alert } from '@mui/material';
import { ConfirmDialog } from './ConfirmDialog';

interface UnlockBaliseDialogProps {
  open: boolean;
  version?: number;
  loading?: boolean;
  disabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Reusable confirmation dialog for unlocking a balise when version has changed.
 * Shows a warning that the current version will become the official version.
 */
export const UnlockBaliseDialog: React.FC<UnlockBaliseDialogProps> = ({
  open,
  version,
  loading = false,
  disabled = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <ConfirmDialog
      open={open}
      title="Vahvista lukituksen avaaminen"
      message={
        <>
          Lukituksen avaaminen asettaa version {version} viralliseksi versioksi.
          <Alert severity="info" sx={{ mt: 2 }}>
            Aiemmat versiot säilyvät versiohistoriassa.
          </Alert>
        </>
      }
      confirmText="Avaa lukitus"
      confirmColor="primary"
      cancelText="Peruuta"
      disabled={disabled}
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};

export default UnlockBaliseDialog;
