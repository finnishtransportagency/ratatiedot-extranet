import React from 'react';
import { Paper, Button, Chip } from '@mui/material';
import { Download, Delete, Lock, LockOpen } from '@mui/icons-material';

interface BulkActionsBarProps {
  selectedCount: number;
  canWrite?: boolean;
  isAdmin?: boolean;
  allSelectedLocked?: boolean;
  onBulkDownload: () => void;
  onBulkLock: () => void;
  onBulkUnlock: () => void;
  onBulkDelete: () => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  canWrite,
  isAdmin,
  allSelectedLocked = false,
  onBulkDownload,
  onBulkLock,
  onBulkUnlock,
  onBulkDelete,
}) => {
  if (selectedCount === 0) return null;

  return (
    <Paper
      sx={{
        p: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 1,
        flexShrink: 0,
        backgroundColor: 'action.selected',
        animation: 'slideIn 0.3s ease-in-out',
        '@keyframes slideIn': {
          '0%': {
            opacity: 0,
            transform: 'translateY(-10px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
      variant="outlined"
    >
      <Button
        size="small"
        variant="outlined"
        color="primary"
        startIcon={<Download fontSize="small" />}
        onClick={onBulkDownload}
        title="Lataa valittujen sanomien viralliset versiot"
      >
        Lataa
      </Button>
      {canWrite && allSelectedLocked && (
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<LockOpen fontSize="small" />}
          size="small"
          onClick={onBulkUnlock}
          title="Avaa lukitus"
        >
          Avaa lukitus
        </Button>
      )}
      {canWrite && !allSelectedLocked && (
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<Lock fontSize="small" />}
          size="small"
          onClick={onBulkLock}
          title="Lukitse"
        >
          Lukitse
        </Button>
      )}
      {isAdmin && (
        <Button
          variant="outlined"
          startIcon={<Delete fontSize="small" />}
          size="small"
          onClick={onBulkDelete}
          title="Poista"
          color="error"
        >
          Poista
        </Button>
      )}
      <Chip label={`${selectedCount} valittu`} size="small" color="primary" />
    </Paper>
  );
};

export default BulkActionsBar;
