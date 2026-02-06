import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  LinearProgress,
  Box,
} from '@mui/material';
import { ConfirmDialog } from './ConfirmDialog';

interface DeleteProgress {
  show: boolean;
  current: number;
  total: number;
  successCount: number;
  failureCount: number;
}

interface DeleteResult {
  show: boolean;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  failedIds: number[];
}

interface BulkDeleteDialogsProps {
  selectedCount: number;
  deleteDialogOpen: boolean;
  deleteProgress: DeleteProgress;
  deleteResult: DeleteResult | null;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  onRetryFailed: () => void;
  onCloseResult: () => void;
}

export const BulkDeleteDialogs: React.FC<BulkDeleteDialogsProps> = ({
  selectedCount,
  deleteDialogOpen,
  deleteProgress,
  deleteResult,
  onDeleteConfirm,
  onDeleteCancel,
  onRetryFailed,
  onCloseResult,
}) => {
  return (
    <>
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Vahvista poisto"
        message={`Haluatko varmasti poistaa ${selectedCount} baliisia? Lukitut baliisit ohitetaan automaattisesti.`}
        confirmText="Poista"
        confirmColor="error"
        onConfirm={onDeleteConfirm}
        onCancel={onDeleteCancel}
      />

      {/* Delete Progress Dialog */}
      <Dialog open={deleteProgress.show} disableEscapeKeyDown>
        <DialogTitle>Poistetaan baliiseja...</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Erä {deleteProgress.current} / {deleteProgress.total}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(deleteProgress.current / deleteProgress.total) * 100}
              sx={{ mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              Onnistuneet: {deleteProgress.successCount}
              {deleteProgress.failureCount > 0 && ` • Epäonnistuneet: ${deleteProgress.failureCount}`}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Delete Result Dialog */}
      <Dialog open={deleteResult?.show ?? false} onClose={onCloseResult}>
        <DialogTitle>Poisto valmis</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Onnistuneesti poistettu: {deleteResult?.successCount ?? 0}
          </Typography>
          {(deleteResult?.skippedCount ?? 0) > 0 && (
            <Typography variant="body1" gutterBottom color="warning.main">
              Ohitettu (lukittu tai ei löytynyt): {deleteResult?.skippedCount}
            </Typography>
          )}
          {(deleteResult?.failureCount ?? 0) > 0 && (
            <Typography variant="body1" gutterBottom color="error">
              Epäonnistuneet: {deleteResult?.failureCount}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          {(deleteResult?.failedIds.length ?? 0) > 0 && (
            <Button onClick={onRetryFailed} color="primary" variant="outlined">
              Yritä uudelleen epäonnistuneita ({deleteResult?.failedIds.length})
            </Button>
          )}
          <Button onClick={onCloseResult} variant="contained">
            Sulje
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BulkDeleteDialogs;
