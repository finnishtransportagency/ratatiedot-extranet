import React, { useState, useMemo, useCallback } from 'react';
import { Box } from '@mui/material';
import {
  mockData as initialMockData,
  IBalise,
  generateBaliseData,
  getAllAreaData,
  areaConfig,
  TOTAL_ITEMS_COUNT,
} from './mockData';
import { BaliseSearch } from './BaliseSearch';
import { AreaFilter } from './AreaFilter';
import { VirtualBaliseTable } from './VirtualBaliseTable';

export const Balise = () => {
  const [data, setData] = useState<IBalise[]>(initialMockData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);

  // Filter data based on search term and selected area
  const filteredData = useMemo(() => {
    let filtered = data;

    // Filter by area first
    if (selectedArea) {
      filtered = filtered.filter((item) => item.area === selectedArea);
    }

    // Then filter by search term
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.secondaryId.toString().includes(lowerSearchTerm) ||
          item.description.toLowerCase().includes(lowerSearchTerm) ||
          item.createdBy.toLowerCase().includes(lowerSearchTerm) ||
          item.editedBy.toLowerCase().includes(lowerSearchTerm) ||
          item.createdTime.toLowerCase().includes(lowerSearchTerm) ||
          item.editedTime.toLowerCase().includes(lowerSearchTerm),
      );
    }

    return filtered;
  }, [data, searchTerm, selectedArea]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleAreaSelect = useCallback(
    async (area: string | null) => {
      setSelectedArea(area);

      // If selecting a specific area and we don't have much data for it, load more
      if (area) {
        const areaItems = data.filter((item) => item.area === area);
        const config = areaConfig[area as keyof typeof areaConfig];

        // If we have less than 100 items for this area, try to load more from that area
        if (areaItems.length < 100 && config) {
          try {
            const newAreaData = getAllAreaData(area).slice(areaItems.length, areaItems.length + 500);
            if (newAreaData.length > 0) {
              setData((prevData) => {
                // Remove existing items from this area to avoid duplicates
                const filteredData = prevData.filter((item) => item.area !== area);
                // Add the existing area items and new ones
                return [...filteredData, ...areaItems, ...newAreaData];
              });
            }
          } catch (error) {
            console.warn('Could not load additional area data:', error);
          }
        }
      }
    },
    [data],
  );

  // Load more items for infinite scroll
  const loadMoreItems = useCallback(
    async (startIndex: number, stopIndex: number) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      const currentLength = data.length;
      if (currentLength >= TOTAL_ITEMS_COUNT) {
        setHasNextPage(false);
        return;
      }

      // Generate more data
      const newItemsCount = Math.min(stopIndex - startIndex + 1, TOTAL_ITEMS_COUNT - currentLength);
      const newItems = generateBaliseData(currentLength, newItemsCount);

      setData((prevData) => [...prevData, ...newItems]);

      if (currentLength + newItemsCount >= TOTAL_ITEMS_COUNT) {
        setHasNextPage(false);
      }
    },
    [data.length],
  );

  const handleLockToggle = (id: string) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id === id
          ? {
              ...item,
              locked: !item.locked,
              lockedTime: !item.locked
                ? new Date().toLocaleDateString('fi-FI') +
                  ' ' +
                  new Date().toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })
                : '',
              lockedBy: !item.locked ? 'LX000001' : '',
            }
          : item,
      ),
    );
  };

  const handleDelete = (id: string) => {
    setData((prevData) => prevData.filter((item) => item.id !== id));
  };

  const handleDownload = (row: IBalise) => {
    // Create file content with some mock data about the balise
    const fileContent = `Balise Information Report
=========================

ID: ${row.secondaryId}
Version: ${row.version}
Description: ${row.description}
Area: ${row.area}
Created By: ${row.createdBy}
Created Time: ${row.createdTime}
Edited By: ${row.editedBy}
Edited Time: ${row.editedTime}
Locked: ${row.locked ? 'Yes' : 'No'}
${row.locked ? `Locked By: ${row.lockedBy}` : ''}
${row.locked ? `Locked Time: ${row.lockedTime}` : ''}

Version History:
${
  row.versions
    ?.map((v) => `  Version ${v.version}: ${v.description} (Created: ${v.createdTime} by ${v.createdBy})`)
    .join('\n') || 'No version history available'
}

Generated on: ${new Date().toLocaleString('fi-FI')}
`;

    // Create and trigger download
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `balise_${row.secondaryId}_report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        margin: 0,
        overflow: 'hidden',
      }}
    >
      {/* Fixed header area with search and filters */}
      <Box sx={{ px: { xs: 1, sm: 2, md: 2 }, pt: { xs: 1, sm: 2, md: 2 }, pb: 1 }}>
        <BaliseSearch onSearch={handleSearch} />
        <AreaFilter selectedArea={selectedArea} onAreaSelect={handleAreaSelect} />
      </Box>

      {/* Table area that takes remaining space */}
      <Box sx={{ flex: 1, overflow: 'hidden', px: { xs: 1, sm: 2, md: 2 }, pb: 1 }}>
        <VirtualBaliseTable
          items={filteredData}
          hasNextPage={hasNextPage && !searchTerm && !selectedArea} // Disable infinite scroll when filtering
          loadMoreItems={loadMoreItems}
          totalCount={TOTAL_ITEMS_COUNT}
          onLockToggle={handleLockToggle}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      </Box>
    </Box>
  );
};
