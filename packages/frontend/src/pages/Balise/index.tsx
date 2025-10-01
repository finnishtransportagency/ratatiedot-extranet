import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress, Button, Paper } from '@mui/material';
import { Add, Download, Delete, Lock } from '@mui/icons-material';
import { IBalise } from './types';
import { BaliseSearch } from './BaliseSearch';
import { AreaFilter } from './AreaFilter';
import { VirtualBaliseTable } from './VirtualBaliseTable';

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

// API function to fetch balises
const fetchBalises = async (filters?: { id_min?: number; id_max?: number }): Promise<IBalise[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.id_min) params.append('id_min', filters.id_min.toString());
    if (filters?.id_max) params.append('id_max', filters.id_max.toString());

    const queryString = params.toString();
    const url = `http://localhost:3001/api/balises${queryString ? `?${queryString}` : ''}`;

    console.log('Fetching balises from:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Transform backend data to match frontend interface
    return data.map((item: any) => ({
      id: item.id.toString(),
      secondaryId: item.secondaryId,
      version: item.version?.toString() || '1',
      description: `Balise ${item.secondaryId}`, // Backend doesn't have description field
      createdTime: item.createdTime || new Date().toISOString(),
      createdBy: item.createdBy || 'Unknown',
      editedTime: item.createdTime || new Date().toISOString(), // Backend doesn't have editedTime
      editedBy: item.createdBy || 'Unknown', // Backend doesn't have editedBy
      locked: item.locked || false,
      area: 'area_1', // Default area - would need mapping logic based on secondaryId ranges
    }));
  } catch (error) {
    console.error('Error fetching balises:', error);
    throw error;
  }
};

export const Balise: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [baliseData, setBaliseData] = useState<IBalise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Load balises on component mount
  useEffect(() => {
    const loadBalises = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch balises in the range 24000-25000 (matching your test data)
        const balises = await fetchBalises({ id_min: 24000, id_max: 25000 });
        setBaliseData(balises);
        console.log('Loaded balises:', balises.length);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load balises';
        setError(errorMessage);
        console.error('Failed to load balises:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBalises();
  }, []);

  // Filtered data based on search and area filter
  const filteredData = useMemo(() => {
    let filtered = baliseData;

    // Apply search filter
    if (searchTerm.trim()) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.secondaryId.toString().includes(searchTerm) ||
          item.description.toLowerCase().includes(lowercaseSearch) ||
          item.createdBy.toLowerCase().includes(lowercaseSearch) ||
          item.editedBy.toLowerCase().includes(lowercaseSearch),
      );
    }

    // Apply area filter
    if (selectedAreas.length > 0) {
      filtered = filtered.filter((item) => item.area && selectedAreas.includes(item.area));
    }

    return filtered;
  }, [baliseData, searchTerm, selectedAreas]);

  // Table action handlers - ready for API integration
  const handleLockToggle = useCallback((id: string) => {
    console.log('Toggle lock for:', id);
    // TODO: Implement API call to toggle lock status
  }, []);

  const handleDelete = useCallback((id: string) => {
    console.log('Delete:', id);
    // TODO: Implement API call to delete item
  }, []);

  const handleDownload = useCallback((row: IBalise) => {
    console.log('Download:', row);
    // TODO: Implement download functionality
  }, []);

  const loadMoreItems = useCallback(async (startIndex: number, stopIndex: number) => {
    console.log('Load more items:', startIndex, stopIndex);
    // TODO: Implement API call to load more items
  }, []);

  // Checkbox selection handlers
  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === filteredData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredData.map((item) => item.id));
    }
  }, [selectedItems.length, filteredData]);

  const handleSelectItem = useCallback((id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  // Bulk action handlers
  const handleBulkDownload = useCallback(() => {
    console.log('Bulk download:', selectedItems);
    // TODO: Implement bulk download
  }, [selectedItems]);

  const handleBulkDelete = useCallback(() => {
    console.log('Bulk delete:', selectedItems);
    // TODO: Implement bulk delete
  }, [selectedItems]);

  const handleBulkLock = useCallback(() => {
    console.log('Bulk lock/unlock:', selectedItems);
    // TODO: Implement bulk lock/unlock
  }, [selectedItems]);

  const handleCreateNew = useCallback(() => {
    console.log('Create new balise');
    // TODO: Implement create new
  }, []);

  return (
    <Box
      sx={{
        p: 3,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}. Make sure your local API server is running on http://localhost:3001
        </Alert>
      )}

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          backgroundColor: 'background.default',
          marginBottom: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleBulkDownload}
              disabled={selectedItems.length === 0}
              size="small"
            >
              Lataa ({selectedItems.length})
            </Button>
            <Button
              variant="outlined"
              startIcon={<Delete />}
              onClick={handleBulkDelete}
              disabled={selectedItems.length === 0}
              size="small"
              color="error"
            >
              Poista ({selectedItems.length})
            </Button>
            <Button
              variant="outlined"
              startIcon={<Lock />}
              onClick={handleBulkLock}
              disabled={selectedItems.length === 0}
              size="small"
            >
              Lukitse ({selectedItems.length})
            </Button>
          </Box>
          <Box sx={{ flex: 1, minWidth: '300px' }}>
            <BaliseSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Hae baliisisanomia..." />
          </Box>
          <AreaFilter areas={AREA_OPTIONS} selectedAreas={selectedAreas} onAreasSelect={setSelectedAreas} />
          <Button variant="contained" startIcon={<Add />} onClick={handleCreateNew} size="small">
            Luo uusi
          </Button>
        </Box>
      </Paper>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading balises...</Typography>
        </Box>
      )}

      {/* Data Table - Takes remaining space */}
      {!loading && (
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <VirtualBaliseTable
            items={filteredData}
            hasNextPage={false} // Set to true when pagination is implemented
            loadMoreItems={loadMoreItems}
            totalCount={filteredData.length}
            onLockToggle={handleLockToggle}
            onDelete={handleDelete}
            onDownload={handleDownload}
            selectedItems={selectedItems}
            onSelectAll={handleSelectAll}
            onSelectItem={handleSelectItem}
          />
        </Box>
      )}

      {/* No Data Message */}
      {!loading && !error && filteredData.length === 0 && baliseData.length === 0 && (
        <Typography variant="body1" sx={{ textAlign: 'center', p: 4 }}>
          No balises found. Make sure your database has test data and your local API server is running.
        </Typography>
      )}
    </Box>
  );
};

export default Balise;
