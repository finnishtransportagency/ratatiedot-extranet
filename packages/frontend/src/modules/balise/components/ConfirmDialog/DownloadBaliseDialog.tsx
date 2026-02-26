import React, { useMemo } from 'react';
import { Box, Alert } from '@mui/material';
import { ConfirmDialog } from './ConfirmDialog';
import type { BaliseWithHistory } from '../../store/baliseStore';

interface DownloadBaliseDialogProps {
  open: boolean;
  baliseToDownload?: BaliseWithHistory | null;
  selectedItems: string[];
  balises: BaliseWithHistory[];
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DownloadBaliseDialog: React.FC<DownloadBaliseDialogProps> = ({
  open,
  baliseToDownload,
  selectedItems,
  balises,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const selectedBalises = useMemo(
    () => (baliseToDownload ? [baliseToDownload] : balises.filter((b) => selectedItems.includes(b.id))),
    [baliseToDownload, balises, selectedItems],
  );

  const title = selectedBalises.length === 1 ? 'Lataa baliisi' : 'Lataa baliisit';

  const baseMessage = (() => {
    if (baliseToDownload) return `Ladataan baliisin ${baliseToDownload.secondaryId} viimeisin virallinen versio.`;
    if (selectedBalises.length === 1)
      return `Ladataan baliisin ${selectedBalises[0].secondaryId} viimeisin virallinen versio.`;
    if (selectedBalises.length > 3)
      return `Ladataan ${selectedBalises.length} baliisin viimeisimmät viralliset versiot ZIP-tiedostona.`;
    return `Ladataan ${selectedBalises.length} baliisin viimeisimmät viralliset versiot.`;
  })();

  const locked = selectedBalises.filter((b) => b.locked);

  const message = (() => {
    if (locked.length === 0) return baseMessage;

    const lockingUsers = Array.from(new Set(locked.map((b) => b.lockedBy).filter(Boolean)));

    if (locked.length === 1) {
      const user = lockingUsers[0];
      return (
        <Box sx={{ mt: 1 }}>
          <Alert sx={{ mb: 2 }} severity="warning">
            Baliisi on lukittu käyttäjän {user} toimesta.
          </Alert>
          <Alert sx={{ mb: 2 }} severity="info">
            {baseMessage}
          </Alert>
        </Box>
      );
    }

    const usersText = lockingUsers.join(', ');
    return (
      <Box sx={{ mt: 1 }}>
        <Alert sx={{ mb: 2 }} severity="warning">
          Valituista baliiseista {locked.length} on lukittu käyttäjien {usersText} toimesta.
        </Alert>
        <Alert sx={{ mb: 2 }} severity="info">
          {baseMessage}
        </Alert>
      </Box>
    );
  })();

  return (
    <ConfirmDialog
      open={open}
      title={title}
      message={message}
      confirmText={loading ? 'Ladataan...' : 'Lataa'}
      cancelText="Peruuta"
      onConfirm={onConfirm}
      onCancel={onCancel}
      loading={loading}
    />
  );
};

export default DownloadBaliseDialog;
