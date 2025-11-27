import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Box,
  Typography,
  CircularProgress,
  Checkbox,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import { ExpandMore, ExpandLess, Edit, Lock, LockOpen, Delete, Download, Visibility } from '@mui/icons-material';
import type { BaliseWithHistory } from './types';

interface BaliseTableProps {
  items: BaliseWithHistory[];
  hasNextPage: boolean;
  isBackgroundLoading?: boolean;
  loadMoreItems: () => Promise<void>;
  totalCount: number;
  onLockToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (row: BaliseWithHistory) => void;
  selectedItems: string[];
  onSelectAll: () => void;
  onSelectItem: (id: string) => void;
  onLoadHistory?: (id: string) => Promise<void>;
  onRowClick?: (row: BaliseWithHistory) => void;
  onEditClick?: (row: BaliseWithHistory) => void;
}

interface ExpandedRows {
  [key: string]: boolean;
}

interface CollapsibleRowProps {
  row: BaliseWithHistory;
  onLockToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (row: BaliseWithHistory) => void;
  isExpanded: boolean;
  onToggleExpanded: (id: string) => void;
  isSelected: boolean;
  onSelectItem: (id: string) => void;
  onLoadHistory?: (id: string) => Promise<void>;
  onContextMenu?: (event: React.MouseEvent, row: BaliseWithHistory) => void;
  onRowClick?: (row: BaliseWithHistory) => void;
}

const getBestLocale = (): string => {
  // 1. Try to get system locale with timezone info
  const formatter = new Intl.DateTimeFormat();
  const resolved = formatter.resolvedOptions();

  // 2. If timezone suggests a specific region, use that
  const timeZone = resolved.timeZone;
  if (timeZone.includes('Helsinki') || timeZone.includes('Europe/Helsinki')) {
    return 'fi-FI';
  }

  // 3. Otherwise use the resolved locale
  return resolved.locale;
};

const formatDateTime = (dateString: string | Date, useRelative = true) => {
  const date = new Date(dateString);
  const locale = getBestLocale();

  if (useRelative) {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24 && diffInHours > 0) {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return rtf.format(-diffInMinutes, 'minute');
      } else {
        return rtf.format(-Math.floor(diffInHours), 'hour');
      }
    }
  }

  return date.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
};

const CollapsibleRow: React.FC<CollapsibleRowProps> = ({
  row,
  onLockToggle,
  onDelete,
  onDownload,
  isExpanded,
  onToggleExpanded,
  isSelected,
  onSelectItem,
  onLoadHistory,
  onContextMenu,
  onRowClick,
}) => {
  const [loadingHistory, setLoadingHistory] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && historyRef.current) {
      // Delay to allow the Collapse animation to complete
      const timer = setTimeout(() => {
        historyRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  const handleToggleExpand = async () => {
    if (!isExpanded && (!row.history || row.history.length === 0) && onLoadHistory) {
      setLoadingHistory(true);
      try {
        await onLoadHistory(row.id);
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setLoadingHistory(false);
      }
    }
    onToggleExpanded(row.id);
  };
  const handleCheckboxClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onSelectItem(row.id);
  };

  const handleRowClick = (event: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = event.target as HTMLElement;
    if (target.closest('input') || target.closest('button') || target.closest('[role="button"]')) {
      return;
    }
    onRowClick?.(row);
  };

  return (
    <>
      <TableRow
        sx={{
          '& > *': { borderBottom: 'unset' },
          cursor: 'pointer',
          '&:hover': { backgroundColor: 'action.hover' },
          backgroundColor: isSelected ? 'action.selected' : 'inherit',
        }}
        onClick={handleRowClick}
        onContextMenu={(event) => onContextMenu?.(event, row)}
      >
        <TableCell sx={{ fontSize: '14px', width: '50px' }}>
          <Checkbox checked={isSelected} onClick={handleCheckboxClick} size="small" />
        </TableCell>
        <TableCell sx={{ fontSize: '14px', width: '80px' }} component="th" scope="row">
          {row.secondaryId}
        </TableCell>
        <TableCell sx={{ fontSize: '14px', width: '200px' }}>
          <Typography
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '14px',
            }}
          >
            {row.description}
          </Typography>
        </TableCell>
        <TableCell sx={{ fontSize: '14px', width: '60px' }}>{row.version}</TableCell>
        <TableCell sx={{ fontSize: '14px', width: '120px' }}>{formatDateTime(row.createdTime)}</TableCell>
        <TableCell sx={{ fontSize: '14px', width: '100px' }}>{row.createdBy}</TableCell>
        <TableCell sx={{ fontSize: '14px', width: '120px' }}>{row.locked ? `🔒 ${row.lockedBy}` : ''}</TableCell>
        <TableCell sx={{ textAlign: 'right', width: '50px' }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleExpand();
            }}
            disabled={loadingHistory}
          >
            {loadingHistory ? <CircularProgress size={16} /> : isExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box ref={historyRef} sx={{ margin: 1, scrollMargin: 16 }}>
              <Typography variant="body1" gutterBottom component="div">
                Historia
              </Typography>
              <Table size="small" aria-label="details">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: '12px' }}>Versio</TableCell>
                    <TableCell sx={{ fontSize: '12px' }}>Kuvaus</TableCell>
                    <TableCell sx={{ fontSize: '12px' }}>Luontiaika</TableCell>
                    <TableCell sx={{ fontSize: '12px' }}>Luonut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingHistory ? (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: 'center', py: 3 }}>
                        <CircularProgress size={20} />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Ladataan historiaa...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : row.history && row.history.length > 0 ? (
                    row.history.map((version, vIndex) => (
                      <TableRow key={`${row.id}-version-${vIndex}`}>
                        <TableCell sx={{ fontSize: '14px' }}>{version.version}</TableCell>
                        <TableCell sx={{ fontSize: '14px' }}>{version.description}</TableCell>
                        <TableCell sx={{ fontSize: '14px' }}>{formatDateTime(version.createdTime)}</TableCell>
                        <TableCell sx={{ fontSize: '14px' }}>{version.createdBy}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: 'center', fontStyle: 'italic' }}>
                        Ei versiohistoriaa saatavilla
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const VirtualBaliseTable: React.FC<BaliseTableProps> = ({
  items,
  hasNextPage,
  isBackgroundLoading = false,
  loadMoreItems,
  totalCount,
  onLockToggle,
  onDelete,
  onDownload,
  selectedItems,
  onSelectAll,
  onSelectItem,
  onLoadHistory,
  onRowClick,
  onEditClick,
}) => {
  const [expandedRows, setExpandedRows] = useState<ExpandedRows>({});
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    rowData: BaliseWithHistory;
  } | null>(null);

  const isAllSelected = selectedItems.length === items.length && items.length > 0;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < items.length;

  const handleToggleExpanded = useCallback((id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // Context menu handlers
  const handleRowContextMenu = useCallback((event: React.MouseEvent, row: BaliseWithHistory) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
      rowData: row,
    });
  }, []);

  const handleContextMenuClose = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Context menu actions
  const handleContextEdit = useCallback(() => {
    if (contextMenu && onEditClick) {
      onEditClick(contextMenu.rowData);
    }
    handleContextMenuClose();
  }, [contextMenu, onEditClick, handleContextMenuClose]);

  const handleContextLock = useCallback(() => {
    if (contextMenu) {
      onLockToggle(contextMenu.rowData.id);
    }
    handleContextMenuClose();
  }, [contextMenu, onLockToggle, handleContextMenuClose]);

  const handleContextDelete = useCallback(() => {
    if (contextMenu) {
      onDelete(contextMenu.rowData.id);
    }
    handleContextMenuClose();
  }, [contextMenu, onDelete, handleContextMenuClose]);

  const handleContextDownload = useCallback(() => {
    if (contextMenu) {
      onDownload(contextMenu.rowData);
    }
    handleContextMenuClose();
  }, [contextMenu, onDownload, handleContextMenuClose]);

  const handleContextViewHistory = useCallback(async () => {
    if (contextMenu && onLoadHistory) {
      try {
        await onLoadHistory(contextMenu.rowData.id);
        handleToggleExpanded(contextMenu.rowData.id);
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    }
    handleContextMenuClose();
  }, [contextMenu, onLoadHistory, handleToggleExpanded, handleContextMenuClose]);

  // Handle escape key and outside clicks for context menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && contextMenu) {
        handleContextMenuClose();
      }
    };

    if (contextMenu) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [contextMenu, handleContextMenuClose]);

  // Intersection Observer for infinite scroll - industry standard approach
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isBackgroundLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isBackgroundLoading) {
          loadMoreItems().catch((error) => {
            console.error('Failed to load more items:', error);
          });
        }
      },
      {
        root: null, // Use viewport as root
        rootMargin: '100px', // Start loading 100px before sentinel is visible
        threshold: 0.1,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isBackgroundLoading, loadMoreItems]);

  return (
    <Paper sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          height: 'calc(100vh - 84px)',
          overflow: 'auto',
        }}
      >
        <Table size="small" sx={{ tableLayout: 'fixed' }}>
          {/* Fixed header */}
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'background.paper' }}>
            <TableRow>
              <TableCell sx={{ fontSize: '12px', width: '50px' }}>
                <Checkbox checked={isAllSelected} indeterminate={isIndeterminate} onChange={onSelectAll} size="small" />
              </TableCell>
              <TableCell sx={{ fontSize: '12px', width: '80px' }}>ID</TableCell>
              <TableCell sx={{ fontSize: '12px', width: '200px' }}>Kuvaus</TableCell>
              <TableCell sx={{ fontSize: '12px', width: '60px' }}>Versio</TableCell>
              <TableCell sx={{ fontSize: '12px', width: '120px' }}>Luontiaika</TableCell>
              <TableCell sx={{ fontSize: '12px', width: '100px' }}>Luonut</TableCell>
              <TableCell sx={{ fontSize: '12px', width: '120px' }}>Lukittu?</TableCell>
              <TableCell sx={{ fontSize: '12px', width: '50px' }}></TableCell>
            </TableRow>
          </TableHead>

          <TableBody sx={{ fontSize: '12px' }}>
            {/* Render all loaded items */}
            {items.map((row: BaliseWithHistory) => (
              <CollapsibleRow
                key={row.id}
                row={row}
                onLockToggle={onLockToggle}
                onDelete={onDelete}
                onDownload={onDownload}
                isExpanded={expandedRows[row.id] || false}
                onToggleExpanded={handleToggleExpanded}
                isSelected={selectedItems.includes(row.id)}
                onSelectItem={onSelectItem}
                onLoadHistory={onLoadHistory}
                onContextMenu={handleRowContextMenu}
                onRowClick={onRowClick}
              />
            ))}

            {/* Intersection Observer Sentinel - invisible trigger for loading more */}
            {hasNextPage && (
              <TableRow>
                <TableCell colSpan={8} sx={{ padding: 0, height: 1 }}>
                  <div ref={sentinelRef} style={{ height: '1px' }} />
                </TableCell>
              </TableRow>
            )}

            {/* Loading indicator */}
            {isBackgroundLoading && (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      Ladataan lisää...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {/* End of data indicator */}
            {!hasNextPage && items.length > 0 && (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Kaikki kohteet ladattu ({items.length} / {totalCount})
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
        slotProps={{
          paper: {
            sx: {
              minWidth: 180,
              boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
              border: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        <MenuItem onClick={handleContextEdit} sx={{ fontSize: '14px', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Edit fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
            Muokkaa
          </Box>
        </MenuItem>

        <MenuItem onClick={handleContextLock} sx={{ fontSize: '14px', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {contextMenu?.rowData.locked ? (
              <LockOpen fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
            ) : (
              <Lock fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
            )}
            {contextMenu?.rowData.locked ? 'Avaa lukitus' : 'Lukitse'}
          </Box>
        </MenuItem>

        <MenuItem onClick={handleContextViewHistory} sx={{ fontSize: '14px', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Visibility fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
            Näytä historia
          </Box>
        </MenuItem>

        <MenuItem onClick={handleContextDownload} sx={{ fontSize: '14px', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Download fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
            Lataa
          </Box>
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={handleContextDelete} sx={{ fontSize: '14px', py: 1, color: 'error.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Delete fontSize="small" sx={{ mr: 1.5, color: 'error.main' }} />
            Poista
          </Box>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default VirtualBaliseTable;
