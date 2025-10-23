import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../constants/Routes';
import { Box, Alert, Button, Paper, IconButton, Chip, LinearProgress } from '@mui/material';
import { Add, Download, Delete, Lock, Upload } from '@mui/icons-material';
import { BaliseSearch } from './BaliseSearch';
import { AreaFilter } from './AreaFilter';
import { VirtualBaliseTable } from './VirtualBaliseTable';
import { useBaliseStore, type BaliseWithHistory } from '../../store/baliseStore';
import { useAreaStore } from '../../store/areaStore';

export const BalisePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Area store
  const { areas: areaOptions, fetchAreas: fetchAreaOptions, error: areaError } = useAreaStore();

  // Balise store state and actions
  const { balises, pagination, isBackgroundLoading, error, fetchBalises, loadMoreBalises, refreshBalise, clearCache } =
    useBaliseStore();

  // Load area options on mount
  useEffect(() => {
    fetchAreaOptions();
  }, [fetchAreaOptions]);

  // Load initial data based on area selection
  const loadInitialData = useCallback(
    async (background = false) => {
      clearCache(); // Always clear cache before loading new data set
      if (selectedAreas.length === 0) {
        // Load all data if no area is selected
        await fetchBalises({ limit: 200, page: 1 }, background);
      } else {
        // Load data for the first selected area
        const selectedAreaDetails = areaOptions.find((area) => area.key === selectedAreas[0]);
        if (selectedAreaDetails) {
          const filter = {
            id_min: selectedAreaDetails.idRangeMin,
            id_max: selectedAreaDetails.idRangeMax,
            limit: 200,
            page: 1,
          };
          await fetchBalises(filter, background);
        }
      }
    },
    [selectedAreas, fetchBalises, areaOptions, clearCache],
  );

  // Initial data load and re-load on area change
  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAreas]); // Re-run when area selection changes

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

  // Table action handlers
  const handleLockToggle = useCallback((id: string) => {
    console.log('Toggle lock for:', id);
  }, []);

  const handleDelete = useCallback((id: string) => {
    console.log('Delete:', id);
  }, []);

  const handleDownload = useCallback((row: BaliseWithHistory) => {
    console.log('Download:', row);
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

  // Bulk actions
  const handleBulkDelete = useCallback(() => {
    console.log('Bulk delete:', selectedItems);
    setSelectedItems([]);
  }, [selectedItems]);

  const handleBulkLock = useCallback(() => {
    console.log('Bulk lock:', selectedItems);
    setSelectedItems([]);
  }, [selectedItems]);

  const handleBulkDownload = useCallback(() => {
    console.log('Bulk download:', selectedItems);
    setSelectedItems([]);
  }, [selectedItems]);

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
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        mt: 1,
        mb: 1,
        overflow: 'hidden',
      }}
    >
      {isBackgroundLoading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }} />}
      {areaError && (
        <Alert severity="error" sx={{ mb: 1 }}>
          Failed to load areas: {areaError}
        </Alert>
      )}
      {error && balises.length > 0 && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Background refresh failed: {error}
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
        }}
        variant="outlined"
      >
        <Box sx={{ minWidth: '200px' }}>
          <Box sx={{ display: selectedItems.length > 0 ? 'flex' : 'none', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<Download fontSize="small" />}
              onClick={handleBulkDownload}
              title="Lataa valitut sanomat"
            >
              Lataa
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<Lock fontSize="small" />}
              size="small"
              onClick={handleBulkLock}
              title="Lukitse/Poista lukitus"
            >
              Lukitse
            </Button>
            <Button
              variant="outlined"
              startIcon={<Delete fontSize="small" />}
              size="small"
              onClick={handleBulkDelete}
              title="Poista"
              color="error"
            >
              Poista
            </Button>
            <Chip label={`${selectedItems.length} valittu`} size="small" color="primary" />
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <Box sx={{ minWidth: '200px' }}>
            <BaliseSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </Box>
          <Box sx={{ minWidth: '200px' }}>
            <AreaFilter areas={areaOptions} selectedAreas={selectedAreas} onAreasSelect={setSelectedAreas} />
          </Box>
          <Box sx={{ margin: 'auto', display: 'flex', gap: 1 }}>
            <IconButton
              id="bulk-upload-button"
              onClick={handleBulkUpload}
              size="small"
              color="secondary"
              title="Massa-lataus"
            >
              <Upload fontSize="inherit" />
            </IconButton>
            <IconButton id="add-button" onClick={handleAddSanoma} size="small" color="primary">
              <Add fontSize="inherit" />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
          loadMoreItems={async () => {
            if (searchTerm === '') {
              await loadMoreBalises();
            }
          }}
          totalCount={pagination?.totalCount ?? filteredData.length}
        />
      </Paper>
    </Box>
  );
};

export default BalisePage;
