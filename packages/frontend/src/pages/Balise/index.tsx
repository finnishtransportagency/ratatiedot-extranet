import React, { useState, useMemo, useCallback } from 'react';
import { Box, Typography, Stack } from '@mui/material';
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

export const Balise: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [baliseData] = useState<IBalise[]>([]); // Empty array - ready for API integration

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
    if (selectedArea) {
      filtered = filtered.filter((item) => item.area === selectedArea);
    }

    return filtered;
  }, [baliseData, searchTerm, selectedArea]);

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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Baliisisanomat
      </Typography>

      <Stack spacing={2}>
        {/* Search Component */}
        <BaliseSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Hae baliisisanomia..." />

        {/* Area Filter Component */}
        <AreaFilter areas={AREA_OPTIONS} selectedArea={selectedArea} onAreaSelect={setSelectedArea} />

        {/* Data Table */}
        <VirtualBaliseTable
          items={filteredData}
          hasNextPage={false} // Set to true when pagination is implemented
          loadMoreItems={loadMoreItems}
          totalCount={filteredData.length}
          onLockToggle={handleLockToggle}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      </Stack>
    </Box>
  );
};

export default Balise;
