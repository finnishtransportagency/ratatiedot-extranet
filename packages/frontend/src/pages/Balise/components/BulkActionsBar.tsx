import React from 'react';
import { Paper, Button, Chip, CircularProgress } from '@mui/material';
import { Download, Delete, Lock } from '@mui/icons-material';

interface BulkActionsBarProps {
  selectedCount: number;
  canWrite?: boolean;
  isAdmin?: boolean;
  isDownloading?: boolean;
  onBulkDownload: () => void;
  onBulkLock: () => void;
  onBulkDelete: () => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  canWrite,
  isAdmin,
  isDownloading,
  onBulkDownload,
  onBulkLock,
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
        startIcon={isDownloading ? <CircularProgress size={16} color="inherit" /> : <Download fontSize="small" />}
        onClick={onBulkDownload}
        disabled={isDownloading}
        title={isDownloading ? 'Ladataan...' : 'Lataa valittujen sanomien viralliset versiot'}
      >
        {isDownloading ? 'Ladataan...' : 'Lataa'}
      </Button>
      {canWrite && (
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<Lock fontSize="small" />}
          size="small"
          onClick={onBulkLock}
          title="Lukitse/Poista lukitus"
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
