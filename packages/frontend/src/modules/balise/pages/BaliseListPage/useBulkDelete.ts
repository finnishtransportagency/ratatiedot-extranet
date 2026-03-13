import { useState, useCallback } from 'react';
import { useBaliseStore, type BaliseWithHistory } from '../../store/baliseStore';

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

const INITIAL_PROGRESS: DeleteProgress = {
  show: false,
  current: 0,
  total: 0,
  successCount: 0,
  failureCount: 0,
};

export const useBulkDelete = (selectedItems: string[], balises: BaliseWithHistory[], onDeleteComplete: () => void) => {
  const { bulkDeleteBalises } = useBaliseStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState<DeleteProgress>(INITIAL_PROGRESS);
  const [deleteResult, setDeleteResult] = useState<DeleteResult | null>(null);

  const executeBulkDelete = useCallback(
    async (ids: number[], onComplete?: () => void) => {
      const BATCH_SIZE = 100;
      const totalBatches = Math.ceil(ids.length / BATCH_SIZE);

      setDeleteProgress({
        show: true,
        current: 0,
        total: totalBatches,
        successCount: 0,
        failureCount: 0,
      });

      try {
        const result = await bulkDeleteBalises(ids, (current, total, successCount, failureCount) => {
          setDeleteProgress({
            show: true,
            current,
            total,
            successCount,
            failureCount,
          });
        });

        setDeleteProgress(INITIAL_PROGRESS);
        setDeleteResult({
          show: true,
          successCount: result.successCount,
          failureCount: result.failureCount,
          skippedCount: result.skippedCount,
          failedIds: result.failedIds,
        });
        onComplete?.();
      } catch (error) {
        console.error('Bulk delete failed:', error);
        setDeleteProgress(INITIAL_PROGRESS);
        setDeleteResult({
          show: true,
          successCount: 0,
          failureCount: ids.length,
          skippedCount: 0,
          failedIds: ids,
        });
      }
    },
    [bulkDeleteBalises],
  );

  const handleBulkDelete = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    setDeleteDialogOpen(false);

    const baliseIds = balises.filter((b) => selectedItems.includes(b.id)).map((b) => b.secondaryId);

    if (baliseIds.length === 0) return;

    await executeBulkDelete(baliseIds, onDeleteComplete);
  }, [selectedItems, balises, executeBulkDelete, onDeleteComplete]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleRetryFailed = useCallback(async () => {
    if (!deleteResult || deleteResult.failedIds.length === 0) return;

    const failedIds = deleteResult.failedIds;

    setDeleteResult(null);

    // Small delay to allow dialog to close and prevent aria-hidden error
    await new Promise((resolve) => setTimeout(resolve, 100));

    await executeBulkDelete(failedIds);
  }, [deleteResult, executeBulkDelete]);

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
