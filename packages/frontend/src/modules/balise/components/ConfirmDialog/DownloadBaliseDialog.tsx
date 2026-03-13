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

  const MAX_REASON_LENGTH = 120;
  const truncateReason = (reason?: string | null) => {
    if (!reason) return '';
    return reason.length > MAX_REASON_LENGTH ? reason.slice(0, MAX_REASON_LENGTH) + '…' : reason;
  };

  const message = (() => {
    if (locked.length === 0) return baseMessage;

    return (
      <Box sx={{ mt: 1 }}>
        {locked.map((b) => (
          <Alert key={b.id} sx={{ mb: 2 }} severity="warning">
            Baliisi {b.secondaryId} on lukittu käyttäjän {b.lockedBy} toimesta.
            <br />
            {b.lockReason ? `Lukitsemisen syy: ${truncateReason(b.lockReason)}` : ''}
          </Alert>
        ))}
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
