import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../constants/Routes';
import { Box, Alert, Button, Paper, Menu, MenuItem, Slide, IconButton, Chip, LinearProgress } from '@mui/material';
import { Add, Download, Delete, Lock, ArrowDropDown } from '@mui/icons-material';
import { BaliseSearch } from './BaliseSearch';
import { AreaFilter } from './AreaFilter';
import { VirtualBaliseTable } from './VirtualBaliseTable';
import { useBaliseStore, type BaliseWithHistory } from '../../store/baliseStore';

// Temporary area configuration - replace with API call
const AREA_OPTIONS = [
  { key: 'area_1', name: 'Alue 1 Helsinki-Riihimäki', shortName: 'Alue 1' },
  { key: 'area_2', name: 'Alue 2 Päijät-Häme', shortName: 'Alue 2' },
  { key: 'area_3', name: 'Alue 3 Etelä-Karjala', shortName: 'Alue 3' },
  { key: 'area_4', name: 'Alue 4 Rauma-Pieksämäki', shortName: 'Alue 4' },
  { key: 'area_5', name: 'Alue 5 Tampereen seutu', shortName: 'Alue 5' },
  { key: 'area_6', name: 'Alue 6 Savon rata', shortName: 'Alue 6' },
  { key: 'area_7', name: 'Alue 7 Karjalan rata', shortName: 'Alue 7' },
  { key: 'area_8', name: 'Alue 8 Yläsavo', shortName: 'Alue 8' },
  { key: 'area_9', name: 'Alue 9 Pohjanmaan rata', shortName: 'Alue 9' },
  { key: 'area_10', name: 'Alue 10 Keski-Suomi', shortName: 'Alue 10' },
  { key: 'area_11', name: 'Alue 11 Kainuu-Oulu', shortName: 'Alue 11' },
  { key: 'area_12', name: 'Alue 12 Oulu-Lappi', shortName: 'Alue 12' },
];

export const BalisePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Store state and actions
  const {
    balises,
    pagination,
    isBackgroundLoading,
    error,
    currentFilters,
    fetchBalises,
    loadMoreBalises,
    refreshBalise,
    clearCache,
  } = useBaliseStore();

  // Area range mapping
  const getAreaRange = useCallback((areaKey: string) => {
    const areaIndex = parseInt(areaKey.split('_')[1]) - 1;
    const ranges = [
      { min: 10000, max: 14999 }, // area_1
      { min: 15000, max: 19999 }, // area_2
      { min: 20000, max: 24999 }, // area_3
      { min: 25000, max: 29999 }, // area_4
      { min: 30000, max: 34999 }, // area_5
      { min: 35000, max: 39999 }, // area_6
      { min: 40000, max: 44999 }, // area_7
      { min: 45000, max: 49999 }, // area_8
      { min: 50000, max: 54999 }, // area_9
      { min: 55000, max: 59999 }, // area_10
      { min: 60000, max: 64999 }, // area_11
      { min: 65000, max: 99999 }, // area_12
    ];
    return ranges[areaIndex];
  }, []);

  // Load initial data with area filtering
  const loadInitialData = useCallback(
    async (background = false) => {
      if (selectedAreas.length === 0) {
        // Load all data (first 50 items from first area for performance)
        await fetchBalises({ limit: 200, page: 1 }, background);
      } else {
        // Load data for selected areas
        const allFilters = selectedAreas.map((areaKey) => {
          const range = getAreaRange(areaKey);
          return {
            id_min: range.min,
            id_max: range.max,
            limit: 200,
            page: 1,
          };
        });

        // For now, just load the first selected area
        if (allFilters.length > 0) {
          await fetchBalises(allFilters[0], background);
        }
      }
    },
    [selectedAreas, fetchBalises, getAreaRange],
  );

  // Initial data load - only run once on mount
  useEffect(() => {
    // If we have no data, do initial load
    if (balises.length === 0) {
      loadInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Reload data when area selection changes
  useEffect(() => {
    // Clear existing data and load new data for selected areas
    clearCache(); // Clear cache to prevent stale data
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAreas]); // Only depend on selectedAreas

  // Check for recently edited balise and refresh it
  useEffect(() => {
    const editedBaliseId = sessionStorage.getItem('editedBaliseId');
    if (editedBaliseId) {
      sessionStorage.removeItem('editedBaliseId');
      // Refresh the specific balise in the background
      refreshBalise(parseInt(editedBaliseId, 10));
    }
  }, [refreshBalise]);

  const handleAddSanoma = () => {
    console.log('Adding new sanoma...');
    navigate(`${Routes.BALISE}/create`);
  };

  const handleAddAlue = () => {
    console.log('Adding new alue...');
    navigate(`${Routes.BALISE}/create`);
  };

  // Handle row click to navigate to detail page (unified view/edit)
  const handleRowClick = useCallback(
    (row: BaliseWithHistory) => {
      // Store the edited item ID in sessionStorage for refresh on return
      sessionStorage.setItem('editedBaliseId', row.secondaryId.toString());
      navigate(`${Routes.BALISE}/${row.secondaryId}`);
    },
    [navigate],
  );

  // Handle edit click from context menu (same as row click now)
  const handleEditClick = useCallback(
    (row: BaliseWithHistory) => {
      // Store the edited item ID in sessionStorage for refresh on return
      sessionStorage.setItem('editedBaliseId', row.secondaryId.toString());
      navigate(`${Routes.BALISE}/${row.secondaryId}`);
    },
    [navigate],
  );

  // Filtered data based on search filter only (area filtering is done at load time)
  const filteredData = useMemo(() => {
    let filtered = balises;

    // Apply search filter
    if (searchTerm.trim()) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.secondaryId.toString().includes(searchTerm) ||
          item.description.toLowerCase().includes(lowercaseSearch) ||
          item.createdBy.toLowerCase().includes(lowercaseSearch) ||
          (item.lockedBy && item.lockedBy.toLowerCase().includes(lowercaseSearch)),
      );
    }

    return filtered;
  }, [balises, searchTerm]);

  // Table action handlers - ready for API integration
  const handleLockToggle = useCallback((id: string) => {
    console.log('Toggle lock for:', id);
    // TODO: Implement API call to toggle lock status
  }, []);

  const handleDelete = useCallback((id: string) => {
    console.log('Delete:', id);
    // TODO: Implement API call to delete item
  }, []);

  const handleDownload = useCallback((row: BaliseWithHistory) => {
    console.log('Download:', row);
    // TODO: Implement download functionality
  }, []);

  const handleLoadHistory = useCallback(
    async (id: string) => {
      console.log('Loading history for:', id);
      // Find the balise and refresh its history
      const balise = balises.find((b) => b.id === id);
      if (balise) {
        await refreshBalise(balise.secondaryId);
      }
    },
    [balises, refreshBalise],
  );

  // Selection handlers
  const handleSelectItem = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const isSelected = prev.includes(id);
      return isSelected ? prev.filter((item) => item !== id) : [...prev, id];
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allIds = filteredData.map((item) => item.id);
    setSelectedItems((prev) => (prev.length === allIds.length ? [] : allIds));
  }, [filteredData]);

  // Bulk actions
  const handleBulkDelete = useCallback(() => {
    console.log('Bulk delete:', selectedItems);
    // TODO: Implement bulk delete API call
    setSelectedItems([]);
  }, [selectedItems]);

  const handleBulkLock = useCallback(() => {
    console.log('Bulk lock:', selectedItems);
    // TODO: Implement bulk lock API call
    setSelectedItems([]);
  }, [selectedItems]);

  const handleBulkDownload = useCallback(() => {
    console.log('Bulk download:', selectedItems);
    // TODO: Implement bulk download functionality
    setSelectedItems([]);
  }, [selectedItems]);

  // Show error without blocking the interface
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
        height: '100%', // Use available height from parent
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        mt: 1,
        mb: 1,
        overflow: 'hidden',
      }}
    >
      {/* Background loading indicator */}
      {isBackgroundLoading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }} />}

      {/* Error banner (non-blocking) */}
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
            <AreaFilter areas={AREA_OPTIONS} selectedAreas={selectedAreas} onAreasSelect={setSelectedAreas} />
          </Box>
          <Box sx={{ margin: 'auto' }}>
            <IconButton id="add-button" onClick={handleAddSanoma} size="small" color="primary">
              <Add fontSize="inherit" />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Table */}
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
            // Only load more if we have no search term
            // Area filters are fine - they're handled by the store
            if (searchTerm === '') {
              // Use the current store filters to load the next page
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
