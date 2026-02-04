import React, { useState } from 'react';
import { Box, Paper, Typography, IconButton, Collapse, Button } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { Tag } from '../../components/Tag';
import type { BaliseWithHistory, Balise, BaliseVersion } from './types';

const pulseAnimation = {
  '@keyframes pulse-blue': {
    '0%, 100%': {
      transform: 'scale(1)',
      opacity: 1,
    },
    '50%': {
      transform: 'scale(1.5)',
      opacity: 0.7,
    },
  },
};

interface BaliseVersionHistoryProps {
  balise: BaliseWithHistory;
  onDownloadVersion: (e: React.MouseEvent<HTMLButtonElement>, version: Balise | BaliseVersion) => Promise<void>;
}

export const BaliseVersionHistory: React.FC<BaliseVersionHistoryProps> = ({ balise, onDownloadVersion }) => {
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());

  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return 'Unknown';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleDateString('fi-FI', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 2,
        border: 1,
        borderColor: 'grey.200',
        backgroundColor: 'background.paper',
      }}
    >
      <Typography variant="h4" sx={{ mb: 3 }}>
        Versiohistoria
      </Typography>

      {/* Combine current version and history for easier mapping */}
      {[balise, ...(balise.history || [])].map((version, index) => {
        const isCurrent = index === 0;
        const isExpanded = expandedVersions.has(isCurrent ? 'current' : version.id);
        const historyLength = balise.history?.length || 0;

        return (
          <Box
            key={isCurrent ? 'current' : version.id}
            sx={{
              display: 'flex',
              gap: 1.75,
              position: 'relative',
              pb: index === historyLength ? 0 : 2.5, // Add padding-bottom to all but the last item
            }}
          >
            {/* Vertical timeline line */}
            {index < historyLength && (
              <Box
                sx={{
                  position: 'absolute',
                  left: '10px',
                  top: '22px',
                  bottom: '-10px',
                  width: '1.5px',
                  bgcolor: 'grey.200',
                }}
              />
            )}

            {/* Timeline Dot */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                width: 22,
                height: 22,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // White ring effect to sit on top of the line
                bgcolor: 'white',
                borderRadius: '50%',
              }}
            >
              {isCurrent ? (
                // Animated dot for current version
                <Box
                  sx={{
                    ...pulseAnimation,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: 'white',
                      animation: 'pulse-blue 2s infinite',
                    }}
                  />
                </Box>
              ) : (
                // Simple dot for past versions
                <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: 'grey.300' }} />
              )}
            </Box>

            {/* Version Info */}
            <Box sx={{ flex: 1, mt: '-2px' }}>
              {/* Header Row */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'text.primary' }}>
                    Versio {version.version || 1}
                  </Typography>
                  {isCurrent && <Tag text="Nykyinen" />}
                </Box>
                <IconButton
                  size="small"
                  sx={{ p: 0.5 }}
                  onClick={() => {
                    const id = isCurrent ? 'current' : version.id;
                    setExpandedVersions((prev) => {
                      const newSet = new Set(prev);
                      if (newSet.has(id)) {
                        newSet.delete(id);
                      } else {
                        newSet.add(id);
                      }
                      return newSet;
                    });
                  }}
                >
                  {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </IconButton>
              </Box>

              {/* Meta Info */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25, fontSize: '0.85rem' }}>
                Muokannut {version.createdBy}, {formatDate(version.createdTime)}
              </Typography>

              {/* Collapsible Details */}
              <Collapse in={isExpanded}>
                <Typography variant="body2" sx={{ mb: 1.5, whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                  {version.description || 'Ei kuvausta.'}
                </Typography>

                {version.fileTypes && version.fileTypes.length > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                      {version.fileTypes.length} tiedostoa
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      onClick={async (e) => {
                        await onDownloadVersion(e, version);
                      }}
                    >
                      Lataa tiedostot
                    </Button>
                  </Box>
                )}
              </Collapse>

              {/* Truncated Description when collapsed */}
              {!isExpanded && (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  {(version.description || '').substring(0, 70)}
                  {(version.description || '').length > 70 && '...'}
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Paper>
  );
};
