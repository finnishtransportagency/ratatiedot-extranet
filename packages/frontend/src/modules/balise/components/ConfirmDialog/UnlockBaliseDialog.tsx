import React from 'react';
import { Alert } from '@mui/material';
import { ConfirmDialog } from './ConfirmDialog';

interface UnlockBaliseDialogProps {
  open: boolean;
  version?: number;
  bulkCount?: number; // Number of balises for bulk unlock
  loading?: boolean;
  disabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Reusable confirmation dialog for unlocking a balise when version has changed.
 * Shows a warning that the current version will become the official version.
 * Supports bulk mode with bulkCount prop.
 */
export const UnlockBaliseDialog: React.FC<UnlockBaliseDialogProps> = ({
  open,
  version,
  bulkCount,
  loading = false,
  disabled = false,
  onConfirm,
  onCancel,
}) => {
  const isBulk = bulkCount !== undefined && bulkCount > 0;
  const title = isBulk ? `Avaa ${bulkCount} baliisin lukitus` : 'Vahvista lukituksen avaaminen';

  const message = isBulk ? (
    <>
      <Alert severity="warning" sx={{ mb: 2 }}>
        Lukituksen avaaminen asettaa uudet versiot virallisiksi.
      </Alert>
      <Alert severity="info">Aiemmat versiot säilyvät versiohistoriassa.</Alert>
    </>
  ) : (
    <>
      Lukituksen avaaminen asettaa version {version} viralliseksi versioksi.
      <Alert severity="info" sx={{ mt: 2 }}>
        Aiemmat versiot säilyvät versiohistoriassa.
      </Alert>
    </>
  );

  return (
    <ConfirmDialog
      open={open}
      title={title}
      message={message}
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
