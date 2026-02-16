import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../constants/Routes';
import { Box, Alert, Button, Paper, IconButton, LinearProgress, CircularProgress } from '@mui/material';
import { Add, Upload, Build } from '@mui/icons-material';
import { BaliseSearch } from './BaliseSearch';
import { SectionFilter } from './Section/SectionFilter';
import { VirtualBaliseTable } from './VirtualBaliseTable';
import { BulkActionsBar } from './components/BulkActionsBar';
import { BulkDeleteDialogs } from './components/BulkDeleteDialogs';
import { ConfirmDialog } from './components/ConfirmDialog';
import { DeleteBaliseDialog } from './components/DeleteBaliseDialog';
import { UnlockBaliseDialog } from './components/UnlockBaliseDialog';
import { LockBaliseDialog } from './components/LockBaliseDialog';
import { useBulkDelete } from './hooks/useBulkDelete';
import { useBaliseLocking } from './hooks/useBaliseLocking';
import { useBaliseStore, type BaliseWithHistory } from '../../store/baliseStore';
import { useSectionStore } from '../../store/sectionStore';
import { downloadMultipleBaliseFiles } from '../../utils/download';
import { useBalisePermissions } from '../../contexts/BalisePermissionsContext';
import { BalisePermissionGuard } from './BalisePermissionGuard';

export const BalisePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [baliseToDelete, setBaliseToDelete] = useState<BaliseWithHistory | null>(null);
  const [contextActionError, setContextActionError] = useState<string | null>(null);

  // Permissions
  const { permissions } = useBalisePermissions();

  // Section store
  const { sections: sectionOptions, fetchSections: fetchSectionOptions, error: sectionError } = useSectionStore();

  // Balise store state and actions
  const {
    balises,
    pagination,
    isInitialLoading,
    isBackgroundLoading,
    error,
    fetchBalises,
    loadMoreBalises,
    refreshBalise,
    clearCache,
    deleteBalise,
  } = useBaliseStore();

  // Lock/unlock handling
  const {
    lockDialogOpen,
    unlockDialogOpen,
    baliseToLock,
    baliseToUnlock,
    isLocking,
    lockingBaliseId,
    handleLockToggle,
    handleLockConfirm,
    handleUnlockConfirm,
    handleLockCancel,
    handleUnlockCancel,
  } = useBaliseLocking({
    onSuccess: async (secondaryId) => {
      await refreshBalise(secondaryId);
    },
    onError: (errorMsg) => setContextActionError(errorMsg),
  });

  // Load section options on mount
  useEffect(() => {
    if (permissions?.canRead) {
      fetchSectionOptions();
    }
  }, [fetchSectionOptions, permissions?.canRead]);

  // Load initial data based on section selection
  const loadInitialData = useCallback(
    async (background = false) => {
      clearCache(); // Always clear cache before loading new data set
      if (selectedSections.length === 0) {
        // Load all data if no section is selected
        await fetchBalises({ limit: 200, page: 1 }, background);
      } else {
        // Get all selected section ranges
        const selectedSectionDetails = sectionOptions.filter((section) => selectedSections.includes(section.key));
        const filter = {
          id_min: selectedSectionDetails.map((s) => s.idRangeMin),
          id_max: selectedSectionDetails.map((s) => s.idRangeMax),
          limit: 200,
          page: 1,
        };
        await fetchBalises(filter, background);
      }
    },
    [selectedSections, fetchBalises, sectionOptions, clearCache],
  );

  // Bulk delete functionality
  const {
    deleteDialogOpen,
    deleteProgress,
    deleteResult,
    handleBulkDelete,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleRetryFailed,
    handleCloseResult,
  } = useBulkDelete(selectedItems, balises, () => setSelectedItems([]));

  // Refresh data after bulk delete completes to fix pagination
  useEffect(() => {
    if (permissions?.canRead && deleteResult?.show && deleteResult.successCount > 0) {
      loadInitialData();
    }
  }, [deleteResult, loadInitialData, permissions?.canRead]);

  // Initial data load and re-load on section change
  useEffect(() => {
    if (permissions?.canRead) {
      loadInitialData();
    }
  }, [selectedSections, loadInitialData, permissions?.canRead]); // Re-run when section selection changes

  // Check for recently edited balise and refresh it
  useEffect(() => {
    const editedBaliseId = sessionStorage.getItem('editedBaliseId');
    if (editedBaliseId) {
      sessionStorage.removeItem('editedBaliseId');
      refreshBalise(parseInt(editedBaliseId, 10));
    }
  }, [refreshBalise]);

  const handleAddSanoma = useCallback(() => {
    navigate(`${Routes.BALISE}/create`);
  }, [navigate]);

  const handleBulkUpload = useCallback(() => {
    navigate(Routes.BALISE_BULK_UPLOAD);
  }, [navigate]);

  const handleAddSection = useCallback(() => {
    navigate(`${Routes.BALISE}/rataosat`);
  }, [navigate]);

  const handleRowClick = useCallback(
    (row: BaliseWithHistory) => {
      sessionStorage.setItem('editedBaliseId', row.secondaryId.toString());
      navigate(`${Routes.BALISE}/${row.secondaryId}`);
    },
    [navigate],
  );

  const handleEditClick = useCallback(
    (row: BaliseWithHistory) => {
      sessionStorage.setItem('editedBaliseId', row.secondaryId.toString());
      navigate(`${Routes.BALISE}/${row.secondaryId}`);
    },
    [navigate],
  );

  // Filtered data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return balises;
    }
    const lowercaseSearch = searchTerm.toLowerCase();
    return balises.filter(
      (item) =>
        item.secondaryId.toString().includes(searchTerm) ||
        item.description.toLowerCase().includes(lowercaseSearch) ||
        item.createdBy.toLowerCase().includes(lowercaseSearch) ||
        (item.lockedBy && item.lockedBy.toLowerCase().includes(lowercaseSearch)),
    );
  }, [balises, searchTerm]);

  const handleDelete = useCallback((row: BaliseWithHistory) => {
    setBaliseToDelete(row);
  }, []);

  const handleDeleteConfirmSingle = useCallback(async () => {
    if (!baliseToDelete) return;

    setIsDeleting(true);
    setContextActionError(null);

    try {
      await deleteBalise(baliseToDelete.secondaryId);
      setBaliseToDelete(null);
    } catch (err) {
      setContextActionError(err instanceof Error ? err.message : 'Poistaminen epäonnistui');
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  }, [baliseToDelete, deleteBalise]);

  const handleDownload = useCallback(async (row: BaliseWithHistory) => {
    try {
      setIsDownloading(true);
      await downloadMultipleBaliseFiles([row.secondaryId]);
    } catch (error) {
      console.error('Error downloading balise files:', error);
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const handleLoadHistory = useCallback(
    async (id: string) => {
      const balise = balises.find((b) => b.id === id);
      if (balise) {
        await refreshBalise(balise.secondaryId);
      }
    },
    [balises, refreshBalise],
  );

  // Selection handlers
  const handleSelectItem = useCallback((id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  const handleSelectAll = useCallback(() => {
    const allIds = filteredData.map((item) => item.id);
    setSelectedItems((prev) => (prev.length === allIds.length ? [] : allIds));
  }, [filteredData]);

  // Other bulk actions
  const handleBulkLock = useCallback(() => {
    console.log('Bulk lock:', selectedItems);
    setSelectedItems([]);
  }, [selectedItems]);

  const handleBulkDownload = useCallback(() => {
    const selectedBalises = balises.filter((b) => selectedItems.includes(b.id));
    if (selectedBalises.length === 0) {
      console.warn('No balises selected for download');
      return;
    }
    setDownloadDialogOpen(true);
  }, [selectedItems, balises]);

  const handleDownloadConfirm = useCallback(async () => {
    try {
      const selectedBalises = balises.filter((b) => selectedItems.includes(b.id));
      const baliseIds = selectedBalises.map((b) => b.secondaryId);

      setIsDownloading(true);
      await downloadMultipleBaliseFiles(baliseIds);
      setSelectedItems([]);
      setDownloadDialogOpen(false);
    } catch (error) {
      console.error('Error downloading files:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [selectedItems, balises]);

  const handleDownloadCancel = useCallback(() => {
    setDownloadDialogOpen(false);
  }, []);

  // Initial loading state
  if (isInitialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  // Error handling for initial load
  if (error && balises.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading balises: {error}
        </Alert>
        <Button variant="contained" onClick={() => loadInitialData()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <BalisePermissionGuard requiredPermission="canRead">
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          mt: 1,
          mb: 1,
          overflow: 'hidden',
          minHeight: 0, // Allows flex children to shrink below content size
        }}
      >
        {isBackgroundLoading && (
          <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }} />
        )}
        {sectionError && (
          <Alert severity="error" sx={{ mb: 1 }}>
            Failed to load sections: {sectionError}
          </Alert>
        )}
        {error && balises.length > 0 && (
          <Alert severity="warning" sx={{ mb: 1 }}>
            Background refresh failed: {error}
          </Alert>
        )}
        {contextActionError && (
          <Alert severity="error" sx={{ mb: 1 }} onClose={() => setContextActionError(null)}>
            {contextActionError}
          </Alert>
        )}
        <Paper
          sx={{
            p: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
            gap: 1,
            flexShrink: 0,
            position: 'relative',
            zIndex: 10,
          }}
          variant="outlined"
        >
          {/* Left side: Search, Filter, and Section Edit button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ minWidth: '200px' }}>
              <BaliseSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            </Box>
            <Box sx={{ minWidth: '200px' }}>
              <SectionFilter
                sections={sectionOptions}
                selectedSections={selectedSections}
                onSectionsSelect={setSelectedSections}
              />
            </Box>
            {permissions?.isAdmin && (
              <IconButton
                id="section-edit-button"
                onClick={handleAddSection}
                size="small"
                color="secondary"
                title="Muokkaa JKV-rataosia"
              >
                <Build fontSize="inherit" transform="scale(0.85)" />
              </IconButton>
            )}
          </Box>

          {/* Right side: Mass Upload and Add buttons */}
          {permissions?.canWrite && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                id="bulk-upload-button"
                onClick={handleBulkUpload}
                size="small"
                color="secondary"
                title="Massa-lataus"
              >
                <Upload fontSize="inherit" />
              </IconButton>
              <IconButton id="add-button" onClick={handleAddSanoma} size="small" color="primary" title="Lisää sanoma">
                <Add fontSize="inherit" />
              </IconButton>
            </Box>
          )}
        </Paper>

        {/* Bulk selection actions - shown when items are selected with animation */}
        <BulkActionsBar
          selectedCount={selectedItems.length}
          canWrite={permissions?.canWrite}
          isAdmin={permissions?.isAdmin}
          onBulkDownload={handleBulkDownload}
          onBulkLock={handleBulkLock}
          onBulkDelete={handleBulkDelete}
        />

        <Paper
          variant="outlined"
          sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}
        >
          <VirtualBaliseTable
            items={filteredData}
            hasNextPage={pagination?.hasNextPage ?? false}
            isBackgroundLoading={isBackgroundLoading}
            selectedItems={selectedItems}
            onRowClick={handleRowClick}
            onEditClick={handleEditClick}
            onLockToggle={handleLockToggle}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onSelectAll={handleSelectAll}
            onSelectItem={handleSelectItem}
            onLoadHistory={handleLoadHistory}
            lockingBaliseId={lockingBaliseId ?? undefined}
            permissions={permissions ?? undefined}
            loadMoreItems={async () => {
              if (searchTerm === '') {
                await loadMoreBalises();
              }
            }}
            totalCount={pagination?.totalCount ?? filteredData.length}
          />
        </Paper>

        <BulkDeleteDialogs
          selectedCount={selectedItems.length}
          deleteDialogOpen={deleteDialogOpen}
          deleteProgress={deleteProgress}
          deleteResult={deleteResult}
          onDeleteConfirm={handleDeleteConfirm}
          onDeleteCancel={handleDeleteCancel}
          onRetryFailed={handleRetryFailed}
          onCloseResult={handleCloseResult}
        />

        <ConfirmDialog
          open={downloadDialogOpen}
          title="Lataa baliisit"
          message={`Lataa ${selectedItems.length} baliisin viralliset versiot ZIP-tiedostona.`}
          confirmText={isDownloading ? 'Ladataan...' : 'Lataa'}
          cancelText="Peruuta"
          onConfirm={handleDownloadConfirm}
          onCancel={handleDownloadCancel}
          loading={isDownloading}
        />

        {/* Single-item Delete Confirmation Dialog */}
        <DeleteBaliseDialog
          open={baliseToDelete !== null}
          secondaryId={baliseToDelete?.secondaryId}
          loading={isDeleting}
          onConfirm={handleDeleteConfirmSingle}
          onCancel={() => setBaliseToDelete(null)}
        />

        {/* Single-item Lock Reason Dialog */}
        <LockBaliseDialog
          open={lockDialogOpen}
          baliseId={baliseToLock?.secondaryId}
          loading={isLocking}
          onConfirm={handleLockConfirm}
          onCancel={handleLockCancel}
        />

        {/* Single-item Unlock Confirmation Dialog (version changed) */}
        <UnlockBaliseDialog
          open={unlockDialogOpen}
          version={baliseToUnlock?.version}
          loading={isLocking}
          onConfirm={handleUnlockConfirm}
          onCancel={handleUnlockCancel}
        />
      </Box>
    </BalisePermissionGuard>
  );
};

export default BalisePage;
