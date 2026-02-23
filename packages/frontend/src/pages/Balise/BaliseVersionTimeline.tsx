import React, { useState, useCallback } from 'react';
import { Box, Paper, Typography, IconButton, Collapse, Button } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { Tag } from '../../components/Tag';
import { downloadBaliseFiles } from '../../utils/download';
import type { BaliseWithHistory, Balise, BaliseVersion } from './types';
import { VersionStatus } from './enums';

const pulseAnimation = {
  '@keyframes pulse': {
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

interface BaliseVersionTimelineProps {
  balise: BaliseWithHistory;
  permissions?: {
    isAdmin: boolean;
    currentUserUid: string | null;
  } | null;
}

export const BaliseVersionTimeline: React.FC<BaliseVersionTimelineProps> = ({ balise, permissions }) => {
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());

  const handleDownloadVersion = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>, version: Balise | BaliseVersion) => {
      e.stopPropagation();
      if (version.fileTypes.length === 0) return;

      try {
        await downloadBaliseFiles([{ secondaryId: version.secondaryId, version: version.version }]);
      } catch (error) {
        console.error('Error downloading version files:', error);
      }
    },
    [],
  );

  // Determine which versions to show
  let visibleVersions: (Balise | BaliseVersion)[] = [];
  if (permissions?.isAdmin) {
    // Admin: show all
    visibleVersions = [balise, ...(balise.history || [])];
  } else if (balise.lockedBy === permissions?.currentUserUid) {
    // Lock owner: show lockedAtVersion (latest official) and drafts
    visibleVersions = [balise, ...(balise.history || [])].filter(
      (v) =>
        (v.versionStatus === VersionStatus.OFFICIAL && v.version === balise.lockedAtVersion) ||
        v.versionStatus === VersionStatus.UNCONFIRMED,
    );
  }

  if (!visibleVersions.length) return null;

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

  // Helper to render timeline dot (container + dot)
  const TimelineDot = ({
    isCurrent,
    isDraft,
    isLockedBaseline,
  }: {
    isCurrent: boolean;
    isDraft: boolean;
    isLockedBaseline: boolean;
  }) => {
    // Animated dot (current)
    if (isCurrent) {
      const color = isDraft ? 'warning.main' : 'primary.main';
      return (
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
            bgcolor: color,
            borderRadius: '50%',
            ...pulseAnimation,
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: 'white',
              animation: 'pulse 2s infinite',
            }}
          />
        </Box>
      );
    }
    // Static dot (locked baseline, draft, or past official)
    let dotColor = 'grey.300';
    if (isDraft) dotColor = 'warning.main';
    else if (isLockedBaseline) dotColor = 'primary.main';
    return (
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
          bgcolor: 'white',
          borderRadius: '50%',
        }}
      >
        <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: dotColor }} />
      </Box>
    );
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

      {/* Unified timeline - show filtered versions */}
      {visibleVersions.map((version, index, filteredVersions) => {
        const isCurrent = index === 0;
        const isExpanded = expandedVersions.has(isCurrent ? 'current' : version.id);
        const isLast = index === filteredVersions.length - 1;
        const isDraft = version.versionStatus === VersionStatus.UNCONFIRMED;
        // Locked baseline: the official version that was locked at
        const isLockedBaseline =
          version.version === balise.lockedAtVersion && version.versionStatus === VersionStatus.OFFICIAL;

        return (
          <Box
            key={isCurrent ? 'current' : version.id}
            sx={{
              display: 'flex',
              gap: 1.75,
              position: 'relative',
              pb: isLast ? 0 : 2.5, // Add padding-bottom to all but the last item
            }}
          >
            {/* Vertical timeline line */}
            {!isLast && (
              <Box
                sx={{
                  position: 'absolute',
                  left: '10px',
                  top: '22px',
                  bottom: '-10px',
                  width: '1.5px',
                  bgcolor: isDraft ? 'warning.light' : 'grey.200',
                }}
              />
            )}

            {/* Timeline Dot */}
            <TimelineDot isCurrent={isCurrent} isDraft={isDraft} isLockedBaseline={isLockedBaseline} />

            {/* Version Info */}
            <Box sx={{ flex: 1, mt: '-2px' }}>
              {/* Header Row */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'text.primary' }}>
                    Versio {version.version || 1}
                  </Typography>
                  {isDraft && <Tag text="Luonnos" color="warning" />}
                  {!isDraft && (isCurrent || isLockedBaseline) && <Tag text="Virallinen" />}
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
                      onClick={(e) => handleDownloadVersion(e, version)}
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
