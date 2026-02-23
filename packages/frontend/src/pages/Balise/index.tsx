import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../constants/Routes';
import { Box, Alert, Button, Paper, LinearProgress, CircularProgress, IconButton } from '@mui/material';
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
import { downloadBaliseFiles } from '../../utils/download';
import { useBalisePermissions } from '../../contexts/BalisePermissionsContext';
import { BalisePermissionGuard } from './BalisePermissionGuard';

export const BalisePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [baliseToDownload, setBaliseToDownload] = useState<BaliseWithHistory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [baliseToDelete, setBaliseToDelete] = useState<BaliseWithHistory | null>(null);
  const [contextActionError, setContextActionError] = useState<string | null>(null);
  const [bulkLockDialogOpen, setBulkLockDialogOpen] = useState(false);
  const [isBulkLocking, setIsBulkLocking] = useState(false);
  const [bulkUnlockDialogOpen, setBulkUnlockDialogOpen] = useState(false);
  const [isBulkUnlocking, setIsBulkUnlocking] = useState(false);

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
    bulkLockBalises,
    bulkUnlockBalises,
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

  const handleAddBalise = useCallback(() => {
    navigate(`${Routes.BALISE}/create`);
  }, [navigate]);

  const handleBulkUpload = useCallback(() => {
    navigate(Routes.BALISE_BULK_UPLOAD);
  }, [navigate]);

  const handleAddSection = useCallback(() => {
    navigate(`${Routes.BALISE}/rataosat`);
  }, [navigate]);

  const isCompact = useMediaQuery('(max-width:1360px)');

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

  const handleDownload = useCallback((row: BaliseWithHistory) => {
    setBaliseToDownload(row);
    setDownloadDialogOpen(true);
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

  // Calculate already locked count for bulk lock dialog
  const alreadyLockedCount = useMemo(() => {
    const selectedBalises = balises.filter((b) => selectedItems.includes(b.id));
    return selectedBalises.filter((b) => b.locked).length;
  }, [balises, selectedItems]);

  // Check if all selected balises are locked (for showing unlock button)
  const allSelectedLocked = useMemo(() => {
    if (selectedItems.length === 0) return false;
    const selectedBalises = balises.filter((b) => selectedItems.includes(b.id));
    return selectedBalises.length > 0 && selectedBalises.every((b) => b.locked);
  }, [balises, selectedItems]);

  // Download dialog message
  const downloadDialogMessage = useMemo(() => {
    if (baliseToDownload) {
      return `Lataa baliisin ${baliseToDownload.secondaryId} virallinen versio.`;
    }
    const selectedBalises = balises.filter((b) => selectedItems.includes(b.id));
    if (selectedBalises.length === 1) {
      return `Lataa baliisin ${selectedBalises[0].secondaryId} virallinen versio.`;
    } else if (selectedBalises.length > 3) {
      return `Lataa ${selectedBalises.length} baliisin viralliset versiot ZIP-tiedostona.`;
    }
    return `Lataa ${selectedBalises.length} baliisin viralliset versiot.`;
  }, [balises, selectedItems, baliseToDownload]);

  // Download dialog title
  const downloadDialogTitle = useMemo(() => {
    if (baliseToDownload) return 'Lataa baliisi';
    return selectedItems.length === 1 ? 'Lataa baliisi' : 'Lataa baliisit';
  }, [selectedItems.length, baliseToDownload]);

  // Other bulk actions
  const handleBulkLock = useCallback(() => {
    if (selectedItems.length > 0) {
      setBulkLockDialogOpen(true);
    }
  }, [selectedItems]);

  const handleBulkLockConfirm = useCallback(
    async (lockReason: string) => {
      try {
        setIsBulkLocking(true);
        const selectedBalises = balises.filter((b) => selectedItems.includes(b.id));
        const baliseIds = selectedBalises.map((b) => b.secondaryId);

        await bulkLockBalises(baliseIds, lockReason);

        setBulkLockDialogOpen(false);
        setSelectedItems([]);
      } catch (error) {
        console.error('Error bulk locking balises:', error);
        setContextActionError(error instanceof Error ? error.message : 'Lukitseminen epäonnistui');
      } finally {
        setIsBulkLocking(false);
      }
    },
    [selectedItems, balises, bulkLockBalises],
  );

  const handleBulkLockCancel = useCallback(() => {
    setBulkLockDialogOpen(false);
  }, []);

  const handleBulkUnlock = useCallback(() => {
    if (selectedItems.length > 0) {
      setBulkUnlockDialogOpen(true);
    }
  }, [selectedItems]);

  const handleBulkUnlockConfirm = useCallback(async () => {
    try {
      setIsBulkUnlocking(true);
      const selectedBalises = balises.filter((b) => selectedItems.includes(b.id));
      const baliseIds = selectedBalises.map((b) => b.secondaryId);

      await bulkUnlockBalises(baliseIds);

      setBulkUnlockDialogOpen(false);
      setSelectedItems([]);
    } catch (error) {
      console.error('Error bulk unlocking balises:', error);
      setContextActionError(error instanceof Error ? error.message : 'Lukituksen avaaminen epäonnistui');
    } finally {
      setIsBulkUnlocking(false);
    }
  }, [selectedItems, balises, bulkUnlockBalises]);

  const handleBulkUnlockCancel = useCallback(() => {
    setBulkUnlockDialogOpen(false);
  }, []);

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
      setIsDownloading(true);

      if (baliseToDownload) {
        // Single download from context menu
        await downloadBaliseFiles([{ secondaryId: baliseToDownload.secondaryId }]);
        setBaliseToDownload(null);
      } else {
        // Bulk download from selection
        const selectedBalises = balises.filter((b) => selectedItems.includes(b.id));
        const baliseData = selectedBalises.map((b) => ({ secondaryId: b.secondaryId }));
        await downloadBaliseFiles(baliseData);
        setSelectedItems([]);
      }

      setDownloadDialogOpen(false);
    } catch (error) {
      console.error('Error downloading files:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [selectedItems, balises, baliseToDownload]);

  const handleDownloadCancel = useCallback(() => {
    setDownloadDialogOpen(false);
    setBaliseToDownload(null);
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
            {permissions?.isAdmin &&
              (isCompact ? (
                <IconButton
                  id="section-edit-button"
                  onClick={handleAddSection}
                  size="small"
                  color="secondary"
                  aria-label="Muokkaa JKV-rataosia"
                  title="Muokkaa JKV-rataosia"
                >
                  <Build fontSize="small" />
                </IconButton>
              ) : (
                <Button
                  id="section-edit-button"
                  onClick={handleAddSection}
                  size="small"
                  variant="outlined"
                  color="secondary"
                  startIcon={<Build fontSize="small" />}
                  aria-label="Muokkaa JKV-rataosia"
                >
                  Muokkaa JKV-rataosia
                </Button>
              ))}
          </Box>

          {/* Right side: Mass Upload and Add buttons */}
          {permissions?.canWrite && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isCompact ? (
                <IconButton
                  id="bulk-upload-button"
                  onClick={handleBulkUpload}
                  size="small"
                  color="secondary"
                  aria-label="Baliisien massalisäys"
                  title="Baliisien massalisäys"
                >
                  <Upload fontSize="small" />
                </IconButton>
              ) : (
                <Button
                  id="bulk-upload-button"
                  onClick={handleBulkUpload}
                  size="small"
                  variant="outlined"
                  color="secondary"
                  startIcon={<Upload fontSize="small" />}
                  aria-label="Baliisien massalisäys"
                >
                  Baliisien massalisäys
                </Button>
              )}
              {isCompact ? (
                <IconButton
                  id="add-button"
                  onClick={handleAddBalise}
                  size="small"
                  color="primary"
                  aria-label="Uusi baliisi"
                  title="Uusi baliisi"
                >
                  <Add fontSize="small" />
                </IconButton>
              ) : (
                <Button
                  id="add-button"
                  onClick={handleAddBalise}
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<Add fontSize="small" />}
                  aria-label="Uusi baliisi"
                >
                  Uusi baliisi
                </Button>
              )}
            </Box>
          )}
        </Paper>

        {/* Bulk selection actions - shown when items are selected with animation */}
        <BulkActionsBar
          selectedCount={selectedItems.length}
          canWrite={permissions?.canWrite}
          isAdmin={permissions?.isAdmin}
          allSelectedLocked={allSelectedLocked}
          onBulkDownload={handleBulkDownload}
          onBulkLock={handleBulkLock}
          onBulkUnlock={handleBulkUnlock}
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
          title={downloadDialogTitle}
          message={downloadDialogMessage}
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

        {/* Bulk Lock Reason Dialog */}
        <LockBaliseDialog
          open={bulkLockDialogOpen}
          bulkCount={selectedItems.length}
          alreadyLockedCount={alreadyLockedCount}
          loading={isBulkLocking}
          onConfirm={handleBulkLockConfirm}
          onCancel={handleBulkLockCancel}
        />

        {/* Single-item Unlock Confirmation Dialog (version changed) */}
        <UnlockBaliseDialog
          open={unlockDialogOpen}
          version={baliseToUnlock?.version}
          loading={isLocking}
          onConfirm={handleUnlockConfirm}
          onCancel={handleUnlockCancel}
        />

        {/* Bulk Unlock Confirmation Dialog */}
        <UnlockBaliseDialog
          open={bulkUnlockDialogOpen}
          bulkCount={selectedItems.length}
          loading={isBulkUnlocking}
          onConfirm={handleBulkUnlockConfirm}
          onCancel={handleBulkUnlockCancel}
        />
      </Box>
    </BalisePermissionGuard>
  );
};

export default BalisePage;
