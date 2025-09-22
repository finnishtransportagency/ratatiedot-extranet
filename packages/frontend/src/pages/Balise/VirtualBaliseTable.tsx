import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { MoreVert, Download, Add, Delete, Lock, LockOpen } from '@mui/icons-material';
import { IBalise } from './types';

interface VirtualBaliseTableProps {
  items: IBalise[];
  hasNextPage: boolean;
  loadMoreItems: (startIndex: number, stopIndex: number) => Promise<void>;
  totalCount: number;
  onLockToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (row: IBalise) => void;
}

interface ExpandedRows {
  [key: string]: boolean;
}

interface CollapsibleRowProps {
  row: IBalise;
  onLockToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (row: IBalise) => void;
  isExpanded: boolean;
  onToggleExpanded: (id: string) => void;
}

const CollapsibleRow: React.FC<CollapsibleRowProps> = ({
  row,
  onLockToggle,
  onDelete,
  onDownload,
  isExpanded,
  onToggleExpanded,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuAction = (action: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    if (action === 'toggle-lock') {
      onLockToggle(row.id);
    } else if (action === 'delete') {
      onDelete(row.id);
    } else if (action === 'download') {
      onDownload(row);
    } else {
      console.log(`Action: ${action} for item: ${row.secondaryId}`);
    }
    handleMenuClose();
  };

  return (
    <>
      <TableRow
        sx={{
          '& > *': { borderBottom: 'unset' },
          cursor: 'pointer',
          '&:hover': { backgroundColor: 'action.hover' },
        }}
        onClick={() => onToggleExpanded(row.id)}
      >
        <TableCell sx={{ fontSize: '14px', width: '80px' }} component="th" scope="row">
          {row.secondaryId}
        </TableCell>
        <TableCell sx={{ fontSize: '14px', width: '60px' }}>{row.version}</TableCell>
        <TableCell sx={{ fontSize: '14px', width: '200px' }}>{row.description}</TableCell>
        <TableCell sx={{ fontSize: '14px', width: '120px' }}>{row.createdTime}</TableCell>
        <TableCell sx={{ fontSize: '14px', width: '100px' }}>{row.createdBy}</TableCell>
        <TableCell sx={{ fontSize: '14px', width: '120px' }}>{row.editedTime}</TableCell>
        <TableCell sx={{ fontSize: '14px', width: '100px' }}>{row.editedBy}</TableCell>
        <TableCell sx={{ fontSize: '14px', width: '80px' }}>{row.locked ? '🔒' : ''}</TableCell>
        <TableCell sx={{ textAlign: 'right', width: '100px' }}>
          <IconButton
            aria-label="more actions"
            size="small"
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click when clicking menu
              handleMenuClick(e);
            }}
          >
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            onClick={(e) => e.stopPropagation()} // Prevent menu container clicks from propagating
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={(e) => handleMenuAction('download', e)}>
              <ListItemIcon>
                <Download fontSize="small" />
              </ListItemIcon>
              <ListItemText>Lataa</ListItemText>
            </MenuItem>
            <MenuItem onClick={(e) => handleMenuAction('create-version', e)}>
              <ListItemIcon>
                <Add fontSize="small" />
              </ListItemIcon>
              <ListItemText>Luo uusi versio</ListItemText>
            </MenuItem>
            <MenuItem onClick={(e) => handleMenuAction('delete', e)}>
              <ListItemIcon>
                <Delete fontSize="small" />
              </ListItemIcon>
              <ListItemText>Poista</ListItemText>
            </MenuItem>
            <MenuItem onClick={(e) => handleMenuAction('toggle-lock', e)}>
              <ListItemIcon>{row.locked ? <LockOpen fontSize="small" /> : <Lock fontSize="small" />}</ListItemIcon>
              <ListItemText>{row.locked ? 'Poista lukitus' : 'Lukitse'}</ListItemText>
            </MenuItem>
          </Menu>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
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
                  {row.versions?.map((version, vIndex) => (
                    <TableRow key={`${row.id}-version-${vIndex}`}>
                      <TableCell sx={{ fontSize: '14px' }}>{version.version}</TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>{version.description}</TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>{version.createdTime}</TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>{version.createdBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const VirtualBaliseTable: React.FC<VirtualBaliseTableProps> = ({
  items,
  hasNextPage,
  loadMoreItems,
  totalCount,
  onLockToggle,
  onDelete,
  onDownload,
}) => {
  const [expandedRows, setExpandedRows] = useState<ExpandedRows>({});
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggleExpanded = useCallback((id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // Infinite scroll implementation
  const handleScroll = useCallback(async () => {
    if (!containerRef.current || isLoading || !hasNextPage) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const threshold = 200; // Start loading when 200px from bottom

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      setIsLoading(true);
      try {
        await loadMoreItems(items.length, items.length + 50);
      } finally {
        setIsLoading(false);
      }
    }
  }, [items.length, loadMoreItems, hasNextPage, isLoading]);

  // Only render visible rows (simple virtualization)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });

  const handleScrollVirtualization = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, clientHeight } = containerRef.current;
    const rowHeight = 60; // Approximate row height
    const containerHeight = clientHeight;
    const buffer = 10; // Buffer rows

    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
    const visibleCount = Math.ceil(containerHeight / rowHeight) + buffer * 2;
    const end = Math.min(items.length, start + visibleCount);

    setVisibleRange({ start, end });
  }, [items.length]);

  // Initial virtualization and scroll setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial virtualization calculation
    handleScrollVirtualization();

    const scrollHandler = () => {
      handleScrollVirtualization();
      handleScroll();
    };

    container.addEventListener('scroll', scrollHandler);
    return () => container.removeEventListener('scroll', scrollHandler);
  }, [handleScrollVirtualization, handleScroll]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  const topSpacer = visibleRange.start * 60; // Approximate row height
  const bottomSpacer = Math.max(0, (items.length - visibleRange.end) * 60);

  return (
    <Paper sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Scrollable container with single table */}
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          height: '100%', // Use full available height
        }}
      >
        <Table size="small" sx={{ tableLayout: 'fixed' }}>
          {/* Fixed header */}
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'background.paper' }}>
            <TableRow>
              <TableCell sx={{ fontSize: '12px', width: '80px' }}>ID</TableCell>
              <TableCell sx={{ fontSize: '12px', width: '60px' }}>Versio</TableCell>
              <TableCell sx={{ fontSize: '12px', width: '200px' }}>Kuvaus</TableCell>
              <TableCell sx={{ fontSize: '12px', width: '120px' }}>Luontiaika</TableCell>
              <TableCell sx={{ fontSize: '12px', width: '100px' }}>Luonut</TableCell>
              <TableCell sx={{ fontSize: '12px', width: '120px' }}>Muokkausaika</TableCell>
              <TableCell sx={{ fontSize: '12px', width: '100px' }}>Muokannut</TableCell>
              <TableCell sx={{ fontSize: '12px', width: '80px' }}>Lukittu?</TableCell>
              <TableCell sx={{ fontSize: '12px', width: '100px' }}>Toiminnot</TableCell>
            </TableRow>
          </TableHead>

          <TableBody sx={{ fontSize: '12px' }}>
            {/* Top spacer for virtualization */}
            {topSpacer > 0 && (
              <TableRow>
                <TableCell colSpan={9} sx={{ padding: 0, height: topSpacer, border: 'none' }} />
              </TableRow>
            )}

            {/* Visible rows */}
            {visibleItems.map((row, index) => (
              <CollapsibleRow
                key={row.id}
                row={row}
                onLockToggle={onLockToggle}
                onDelete={onDelete}
                onDownload={onDownload}
                isExpanded={expandedRows[row.id] || false}
                onToggleExpanded={handleToggleExpanded}
              />
            ))}

            {/* Bottom spacer for virtualization */}
            {bottomSpacer > 0 && (
              <TableRow>
                <TableCell colSpan={9} sx={{ padding: 0, height: bottomSpacer, border: 'none' }} />
              </TableRow>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={9} sx={{ textAlign: 'center', p: 2 }}>
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
                <TableCell colSpan={9} sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Kaikki kohteet ladattu ({items.length} / {totalCount})
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
};

export default VirtualBaliseTable;
