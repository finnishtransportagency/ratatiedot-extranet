import { useState, useCallback } from 'react';
import { useBaliseStore, type BaliseWithHistory } from '../../../store/baliseStore';

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

export const useBulkDelete = (selectedItems: string[], balises: BaliseWithHistory[], onDeleteComplete: () => void) => {
  const { bulkDeleteBalises } = useBaliseStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState<DeleteProgress>({
    show: false,
    current: 0,
    total: 0,
    successCount: 0,
    failureCount: 0,
  });
  const [deleteResult, setDeleteResult] = useState<DeleteResult | null>(null);

  const handleBulkDelete = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    setDeleteDialogOpen(false);

    // Get balise IDs from selected items
    const baliseIds = balises.filter((b) => selectedItems.includes(b.id)).map((b) => b.secondaryId);

    if (baliseIds.length === 0) return;

    // Calculate total batches for display
    const BATCH_SIZE = 100;
    const totalBatches = Math.ceil(baliseIds.length / BATCH_SIZE);

    // Show progress
    setDeleteProgress({
      show: true,
      current: 0,
      total: totalBatches,
      successCount: 0,
      failureCount: 0,
    });

    try {
      const result = await bulkDeleteBalises(baliseIds, (current, total, successCount, failureCount) => {
        setDeleteProgress({
          show: true,
          current,
          total,
          successCount,
          failureCount,
        });
      });

      // Hide progress and show result
      setDeleteProgress({ show: false, current: 0, total: 0, successCount: 0, failureCount: 0 });
      setDeleteResult({
        show: true,
        successCount: result.successCount,
        failureCount: result.failureCount,
        skippedCount: result.skippedCount,
        failedIds: result.failedIds,
      });
      onDeleteComplete();
    } catch (error) {
      console.error('Bulk delete failed:', error);
      setDeleteProgress({ show: false, current: 0, total: 0, successCount: 0, failureCount: 0 });
      setDeleteResult({
        show: true,
        successCount: 0,
        failureCount: baliseIds.length,
        skippedCount: 0,
        failedIds: baliseIds,
      });
    }
  }, [selectedItems, balises, bulkDeleteBalises, onDeleteComplete]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleRetryFailed = useCallback(async () => {
    if (!deleteResult || deleteResult.failedIds.length === 0) return;

    const failedIds = deleteResult.failedIds;

    // Close result dialog first
    setDeleteResult(null);

    // Small delay to allow dialog to close and prevent aria-hidden error
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Calculate total batches for display
    const BATCH_SIZE = 100;
    const totalBatches = Math.ceil(failedIds.length / BATCH_SIZE);

    // Show progress
    setDeleteProgress({
      show: true,
      current: 0,
      total: totalBatches,
      successCount: 0,
      failureCount: 0,
    });

    try {
      const result = await bulkDeleteBalises(failedIds, (current, total, successCount, failureCount) => {
        setDeleteProgress({
          show: true,
          current,
          total,
          successCount,
          failureCount,
        });
      });

      // Hide progress and show result
      setDeleteProgress({ show: false, current: 0, total: 0, successCount: 0, failureCount: 0 });
      setDeleteResult({
        show: true,
        successCount: result.successCount,
        failureCount: result.failureCount,
        skippedCount: result.skippedCount,
        failedIds: result.failedIds,
      });
    } catch (error) {
      console.error('Retry failed:', error);
      setDeleteProgress({ show: false, current: 0, total: 0, successCount: 0, failureCount: 0 });
    }
  }, [deleteResult, bulkDeleteBalises]);

  const handleCloseResult = useCallback(() => {
    setDeleteResult(null);
  }, []);

  return {
    deleteDialogOpen,
    deleteProgress,
    deleteResult,
    handleBulkDelete,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleRetryFailed,
    handleCloseResult,
  };
};
