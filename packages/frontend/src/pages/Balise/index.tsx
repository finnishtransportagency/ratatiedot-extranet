import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../constants/Routes';
import { Box, Alert, Button, Paper, IconButton, Chip, LinearProgress } from '@mui/material';
import { Add, Download, Delete, Lock, Upload, Build } from '@mui/icons-material';
import { BaliseSearch } from './BaliseSearch';
import { SectionFilter } from './Section/SectionFilter';
import { VirtualBaliseTable } from './VirtualBaliseTable';
import { useBaliseStore, type BaliseWithHistory } from '../../store/baliseStore';
import { useSectionStore } from '../../store/sectionStore';
import { downloadBaliseFiles, downloadMultipleBaliseFiles } from '../../utils/download';

export const BalisePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Section store
  const { sections: sectionOptions, fetchSections: fetchSectionOptions, error: sectionError } = useSectionStore();

  // Balise store state and actions
  const { balises, pagination, isBackgroundLoading, error, fetchBalises, loadMoreBalises, refreshBalise, clearCache } =
    useBaliseStore();

  // Load section options on mount
  useEffect(() => {
    fetchSectionOptions();
  }, [fetchSectionOptions]);

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

  // Initial data load and re-load on section change
  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSections]); // Re-run when section selection changes

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

  // Table action handlers
  const handleLockToggle = useCallback((id: string) => {
    console.log('Toggle lock for:', id);
  }, []);

  const handleDelete = useCallback((id: string) => {
    console.log('Delete:', id);
  }, []);

  const handleDownload = useCallback(async (row: BaliseWithHistory) => {
    try {
      if (row.fileTypes.length === 0) {
        console.warn('No files to download for balise', row.secondaryId);
        return;
      }
      await downloadBaliseFiles(row.secondaryId, row.fileTypes);
    } catch (error) {
      console.error('Error downloading balise files:', error);
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

  // Bulk actions
  const handleBulkDelete = useCallback(() => {
    console.log('Bulk delete:', selectedItems);
    setSelectedItems([]);
  }, [selectedItems]);

  const handleBulkLock = useCallback(() => {
    console.log('Bulk lock:', selectedItems);
    setSelectedItems([]);
  }, [selectedItems]);

  const handleBulkDownload = useCallback(async () => {
    try {
      const selectedBalises = balises.filter((b) => selectedItems.includes(b.id));
      const downloadData = selectedBalises
        .filter((b) => b.fileTypes.length > 0)
        .map((b) => ({
          baliseId: b.secondaryId,
          files: b.fileTypes,
        }));

      if (downloadData.length === 0) {
        console.warn('No files to download from selected balises');
        return;
      }

      await downloadMultipleBaliseFiles(downloadData);
      setSelectedItems([]);
    } catch (error) {
      console.error('Error downloading files:', error);
    }
  }, [selectedItems, balises]);

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
        minHeight: 0, // Allows flex children to shrink below content size
      }}
    >
      {isBackgroundLoading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }} />}
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
          <IconButton
            id="section-edit-button"
            onClick={handleAddSection}
            size="small"
            color="secondary"
            title="Muokkaa rataosia"
          >
            <Build fontSize="inherit" transform="scale(0.85)" />
          </IconButton>
        </Box>

        {/* Right side: Mass Upload and Add buttons */}
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
      </Paper>

      {/* Bulk selection actions - shown when items are selected with animation */}
      {selectedItems.length > 0 && (
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
        </Paper>
      )}

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
