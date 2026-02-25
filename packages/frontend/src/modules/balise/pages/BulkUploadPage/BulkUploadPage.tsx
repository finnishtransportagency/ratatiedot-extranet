import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../../../constants/Routes';
import { BalisePermissionGuard } from '../../components/BalisePermissionGuard';
import { useBalisePermissions } from '../../contexts/BalisePermissionsContext';
import { useBatchUpload } from './useBatchUpload';
import { useFileDragDrop } from '../../hooks/useFileDragDrop';
import {
  parseBaliseIdFromFilename,
  isValidBaliseIdRange,
  MIN_BALISE_ID,
  MAX_BALISE_ID,
  getValidExtensionsList,
} from '../../utils/baliseValidation';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  LinearProgress,
  Collapse,
  Chip,
  Divider,
  TextField,
} from '@mui/material';
import {
  ArrowBack,
  DriveFolderUpload,
  Cancel,
  Close,
  CloudUpload,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  ExpandMore,
  ExpandLess,
  Description,
  Lock,
  Add,
  Update,
} from '@mui/icons-material';

interface FileWithBaliseId {
  file: File;
  baliseId: number | null;
  isValid: boolean;
}

const SUMMARY_MODE_THRESHOLD = 50;

export const BulkUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileWithBaliseId[]>([]);
  const {
    uploadBatches,
    isUploading: uploading,
    progress: batchProgress,
    uploadResult,
    error,
    resetState: resetUploadState,
  } = useBatchUpload();
  const [localError, setLocalError] = useState<string | null>(null);
  const [expandedBalises, setExpandedBalises] = useState<Set<number>>(new Set());
  const [unchangedBaliseIds, setUnchangedBaliseIds] = useState<number[]>([]);
  const [globalDescription, setGlobalDescription] = useState<string>('');
  const [baliseDescriptions, setBaliseDescriptions] = useState<Record<number, string>>({});
  const [existingBalises, setExistingBalises] = useState<
    Record<number, { version: number; description: string; locked: boolean; lockedBy?: string | null }>
  >({});
  const [loadingBaliseData, setLoadingBaliseData] = useState(false);

  const { permissions } = useBalisePermissions();

  // Fetch existing balise data for preview
  const fetchBaliseData = useCallback(async (baliseIds: number[]) => {
    if (baliseIds.length === 0) return;

    setLoadingBaliseData(true);
    try {
      const response = await fetch(`/api/balises?ids=${baliseIds.join(',')}`);
      if (response.ok) {
        const responseData = await response.json();
        const balises = responseData.data || responseData; // Handle both paginated and direct array response
        const baliseMap: Record<
          number,
          { version: number; description: string; locked: boolean; lockedBy?: string | null }
        > = {};
        balises.forEach(
          (b: {
            secondaryId: number;
            version: number;
            description: string;
            locked: boolean;
            lockedBy?: string | null;
          }) => {
            baliseMap[b.secondaryId] = {
              version: b.version,
              description: b.description,
              locked: b.locked,
              lockedBy: b.lockedBy,
            };
          },
        );
        setExistingBalises(baliseMap);
      }
    } catch (err) {
      console.error('Failed to fetch balise data:', err);
    } finally {
      setLoadingBaliseData(false);
    }
  }, []);

  const processFiles = useCallback(
    (newFiles: File[]) => {
      const processedFiles: FileWithBaliseId[] = newFiles.map((file) => {
        const baliseId = parseBaliseIdFromFilename(file.name);
        return {
          file,
          baliseId,
          isValid: baliseId !== null && isValidBaliseIdRange(baliseId),
        };
      });

      setFiles((prev) => {
        const updated = [...prev, ...processedFiles];
        // Extract unique balise IDs to fetch data
        const baliseIds = Array.from(
          new Set(updated.filter((f) => f.isValid && f.baliseId).map((f) => f.baliseId as number)),
        );
        fetchBaliseData(baliseIds);
        return updated;
      });
      setLocalError(null);
      resetUploadState();
    },
    [fetchBaliseData, resetUploadState],
  );

  const { isDragging, handleDragOver, handleDragLeave, handleDrop } = useFileDragDrop(processFiles);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      processFiles(selectedFiles);
    },
    [processFiles],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeBaliseFiles = useCallback((baliseId: number) => {
    setFiles((prev) => prev.filter((f) => f.baliseId !== baliseId));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    resetUploadState();
    setLocalError(null);
    setUnchangedBaliseIds([]);
    setGlobalDescription('');
    setBaliseDescriptions({});
    // Reset file input to allow re-selecting the same files
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [resetUploadState]);

  // Group files by balise ID for display
  const groupedFiles = files.reduce(
    (acc, item) => {
      if (item.isValid && item.baliseId !== null) {
        if (!acc[item.baliseId]) {
          acc[item.baliseId] = [];
        }
        acc[item.baliseId].push(item.file);
      }
      return acc;
    },
    {} as Record<number, File[]>,
  );

  const invalidFiles = files.filter((f) => !f.isValid);
  const validFileCount = files.filter((f) => f.isValid).length;
  const baliseCount = Object.keys(groupedFiles).length;

  // Get balises with lock issues
  const balisesWithLockIssues = Object.entries(groupedFiles).filter(([baliseId]) => {
    const bId = parseInt(baliseId);
    const existing = existingBalises[bId];
    return existing && (!existing.locked || (existing.lockedBy && existing.lockedBy !== permissions?.currentUserUid));
  });

  const lockIssueCount = balisesWithLockIssues.length;
  const hasLockIssues = lockIssueCount > 0;

  // Count files from balises with lock issues
  const lockedBaliseFileCount = balisesWithLockIssues.reduce((count, [, baliseFiles]) => count + baliseFiles.length, 0);

  // Count files only from balises without lock issues
  const validBaliseFileCount = validFileCount - lockedBaliseFileCount;

  // Summary mode for large uploads
  const isSummaryMode = baliseCount > SUMMARY_MODE_THRESHOLD;

  // Category counts for summary view
  const validBaliseEntries = Object.entries(groupedFiles).filter(([baliseId]) => {
    const bId = parseInt(baliseId);
    const existingData = existingBalises[bId];
    return (
      !existingData ||
      (existingData.locked && (!existingData.lockedBy || existingData.lockedBy === permissions?.currentUserUid))
    );
  });

  const newBalises = validBaliseEntries.filter(([baliseId]) => !existingBalises[parseInt(baliseId)]);
  const updateBalises = validBaliseEntries.filter(([baliseId]) => existingBalises[parseInt(baliseId)]);

  const newBaliseCount = newBalises.length;
  const newBaliseFileCount = newBalises.reduce((sum, [, files]) => sum + files.length, 0);
  const updateBaliseCount = updateBalises.length;
  const updateBaliseFileCount = updateBalises.reduce((sum, [, files]) => sum + files.length, 0);

  // Determine which balises require individual descriptions (those that will be uploaded)
  const requiredBaliseIds = validBaliseEntries.map(([baliseId]) => parseInt(baliseId, 10));

  // Validation: require either global description, or that every required balise
  // has an explicit per-balise description. In summary mode we require the global description.
  const descriptionsValid =
    (globalDescription && globalDescription.trim().length > 0) ||
    (!isSummaryMode &&
      requiredBaliseIds.length > 0 &&
      requiredBaliseIds.every((id) => (baliseDescriptions[id] || '').trim().length > 0));

  const toggleBaliseExpand = (baliseId: number, hasError: boolean) => {
    // Only allow expanding balises that have errors
    if (!hasError) return;

    setExpandedBalises((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(baliseId)) {
        newSet.delete(baliseId);
      } else {
        newSet.add(baliseId);
      }
      return newSet;
    });
  };

  const handleUpload = async () => {
    if (validFileCount === 0) {
      setLocalError('Ei ladattavia tiedostoja');
      return;
    }

    const requestedBaliseIds = Object.keys(groupedFiles)
      .map((id) => parseInt(id, 10))
      .sort((a, b) => a - b);

    setLocalError(null);
    setUnchangedBaliseIds([]);

    const result = await uploadBatches(files, globalDescription, baliseDescriptions);

    if (result) {
      // Track unchanged balises (those that failed or weren't processed)
      if (result.results.some((r) => !r.success)) {
        const unchangedIds = requestedBaliseIds.filter(
          (id) => !result.results.some((r) => r.success && r.baliseId === id),
        );
        setUnchangedBaliseIds(unchangedIds);
      }

      // Auto-expand failed balises
      const failedBaliseIds = result.results.filter((r) => !r.success).map((r) => r.baliseId);
      setExpandedBalises(new Set(failedBaliseIds));
    }
  };

  const handleBack = () => {
    navigate(Routes.BALISE);
  };

  const handleUploadAnother = () => {
    clearAll();
  };

  return (
    <BalisePermissionGuard requiredPermission="canWrite">
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Fixed Header */}
        <Box
          sx={{
            p: 1.5,
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={handleBack} size="small">
                  <ArrowBack fontSize="inherit" />
                </IconButton>
                <Typography variant="h6">Lähetä tiedostoja</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {files.length > 0 && !uploadResult && (
                  <>
                    <Button
                      variant="outlined"
                      onClick={clearAll}
                      disabled={uploading}
                      size="small"
                      color="secondary"
                      startIcon={<Cancel />}
                    >
                      Tyhjennä
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
                      onClick={handleUpload}
                      disabled={
                        uploading || validFileCount === 0 || hasLockIssues || loadingBaliseData || !descriptionsValid
                      }
                      size="small"
                    >
                      {uploading ? 'Ladataan...' : `Lataa ${validFileCount} tiedostoa`}
                    </Button>
                  </>
                )}
                {uploadResult && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUploadAnother}
                    size="small"
                    startIcon={<CloudUpload />}
                  >
                    Lataa lisää
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Scrollable Content */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            bgcolor: 'grey.50',
          }}
        >
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            {(error || localError) && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLocalError(null)}>
                {error || localError}
              </Alert>
            )}

            {/* Upload Progress */}
            {uploading && (
              <Paper sx={{ p: 3, mb: 2 }} variant="outlined">
                <Typography variant="h6" gutterBottom>
                  Ladataan tiedostoja...
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={
                    batchProgress.totalBatches > 0 ? (batchProgress.currentBatch / batchProgress.totalBatches) * 100 : 0
                  }
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Erä {batchProgress.currentBatch} / {batchProgress.totalBatches}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tiedostoja ladattu: {batchProgress.filesUploaded} / {batchProgress.totalFiles}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Baliisit: {batchProgress.successCount} onnistui
                    {batchProgress.failureCount > 0 && `, ${batchProgress.failureCount} epäonnistui`}
                  </Typography>
                  {batchProgress.retriedBatches > 0 && (
                    <Typography variant="body2" color="warning.main">
                      {batchProgress.retriedBatches} erää yritetty uudelleen
                    </Typography>
                  )}
                </Box>
              </Paper>
            )}

            {/* Upload Result */}
            {uploadResult && (
              <Paper sx={{ p: 3, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  {uploadResult.success ? (
                    <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
                  ) : (
                    <Warning sx={{ fontSize: 40, color: 'warning.main' }} />
                  )}
                  <Box>
                    <Typography variant="h6">{uploadResult.message}</Typography>
                    {uploadResult.success &&
                      uploadResult.totalFiles !== undefined &&
                      uploadResult.totalBalises !== undefined && (
                        <Typography variant="body2" color="text.secondary">
                          Yhteensä {uploadResult.totalFiles} tiedostoa, {uploadResult.totalBalises} baliisia
                        </Typography>
                      )}
                  </Box>
                </Box>

                {uploadResult.invalidFiles && uploadResult.invalidFiles.length > 0 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight={500}>
                      Virheelliset tiedostonimet ({uploadResult.invalidFiles.length}):
                    </Typography>
                    <Typography variant="body2">{uploadResult.invalidFiles.join(', ')}</Typography>
                  </Alert>
                )}

                {unchangedBaliseIds.length > 0 && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight={500}>
                      Seuraavia baliiseja ei luotu/muokattu:
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {unchangedBaliseIds.map((baliseId) => (
                        <Chip
                          key={baliseId}
                          label={baliseId}
                          size="small"
                          color="info"
                          variant="outlined"
                          sx={{ cursor: 'default' }}
                        />
                      ))}
                    </Box>
                  </Alert>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {uploadResult.success ? 'Tulokset baliiseittain:' : 'Virheet baliiseittain:'}
                </Typography>
                <List dense disablePadding>
                  {uploadResult.results.map((result) => {
                    // Determine if this is a lock-related error (yellow) or system error (red)
                    const isLockError = result.errorType === 'locked_by_other' || result.errorType === 'not_locked';

                    return (
                      <ListItem
                        key={result.baliseId}
                        sx={{
                          mb: 1,
                          borderRadius: 1,
                          border: 1,
                          borderColor: result.success ? 'success.light' : isLockError ? 'warning.light' : 'error.light',
                          bgcolor: result.success
                            ? 'success.lighter'
                            : isLockError
                              ? 'warning.lighter'
                              : 'error.lighter',
                          flexDirection: 'column',
                          alignItems: 'stretch',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            cursor: result.success ? 'default' : 'pointer',
                          }}
                          onClick={() => toggleBaliseExpand(result.baliseId, !result.success)}
                        >
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            {result.success ? (
                              <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                            ) : result.errorType === 'locked_by_other' || result.errorType === 'not_locked' ? (
                              <Lock sx={{ color: 'warning.main', fontSize: 20 }} />
                            ) : (
                              <ErrorIcon sx={{ color: 'error.main', fontSize: 20 }} />
                            )}
                            <Typography variant="body2" fontWeight={500}>
                              Baliisi {result.baliseId}
                            </Typography>
                            {result.success && (
                              <>
                                {result.isNewBalise ? (
                                  <Chip label="UUSI" size="small" color="success" icon={<Add />} />
                                ) : (
                                  <Chip
                                    label={`v${result.previousVersion} → v${result.newVersion}`}
                                    size="small"
                                    color="primary"
                                    icon={<Update />}
                                  />
                                )}
                                <Chip label={`${result.filesUploaded} tiedostoa`} size="small" variant="outlined" />
                              </>
                            )}
                            {result.errorType === 'locked_by_other' && (
                              <Chip label="Lukittu" size="small" color="warning" />
                            )}
                            {result.errorType === 'not_locked' && (
                              <Chip label="Lukitsematon" size="small" color="warning" />
                            )}
                          </Box>
                          {!result.success && (
                            <IconButton size="small">
                              {expandedBalises.has(result.baliseId) ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          )}
                        </Box>
                        <Collapse in={expandedBalises.has(result.baliseId)}>
                          <Box sx={{ mt: 1, pl: 4, pb: 1 }}>
                            {result.error && (
                              <Alert severity={isLockError ? 'warning' : 'error'} sx={{ py: 0.5 }}>
                                {result.error}
                                {result.lockedBy && result.errorType === 'locked_by_other' && (
                                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                    Lukituksen voi poistaa käyttäjä {result.lockedBy} tai järjestelmän ylläpitäjä.
                                  </Typography>
                                )}
                              </Alert>
                            )}
                          </Box>
                        </Collapse>
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>
            )}

            {/* File Drop Zone (shown when no results) */}
            {!uploadResult && (
              <>
                <Paper
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  sx={{
                    p: 4,
                    mb: 3,
                    textAlign: 'center',
                    border: '2px dashed',
                    borderColor: isDragging ? 'primary.main' : 'divider',
                    bgcolor: isDragging ? 'action.hover' : 'background.paper',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleFileSelect}
                    id="bulk-file-upload"
                    ref={fileInputRef}
                  />
                  <label
                    htmlFor="bulk-file-upload"
                    style={{
                      cursor: 'pointer',
                      display: 'block',
                    }}
                  >
                    <DriveFolderUpload sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Raahaa tiedostot tähän tai klikkaa valitaksesi
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Tiedostojen nimet määrittävät baliisin: esim. <strong>10000.il</strong> → baliisi 10000
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      Tuetut tiedostot: .il, .leu, .bis, .pdf, .xlsx ja muut
                    </Typography>
                  </label>
                </Paper>

                {/* Invalid Files Warning */}
                {invalidFiles.length > 0 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {invalidFiles.length} tiedostoa hylättiin:
                    </Typography>
                    <Typography variant="body2">{invalidFiles.map((f) => f.file.name).join(', ')}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Hyväksytty muoto: {'{'}ID{'}'}.pääte tai {'{'}ID{'}'}K.pääte ({getValidExtensionsList()}), missä
                      ID on välillä {MIN_BALISE_ID}-{MAX_BALISE_ID}.
                    </Typography>
                  </Alert>
                )}

                {/* Lock Issues Warning */}
                {lockIssueCount > 0 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Baliiseja lukitsematta tai lukittu toisen käyttäjän toimesta. Lukitse baliisit lisätäksesi niille
                    tiedostoja.
                  </Alert>
                )}

                {/* Balises with Lock Issues */}
                {lockIssueCount > 0 && (
                  <Paper sx={{ p: 3, mb: 2 }} variant="outlined">
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Baliisit joita ei voida muokata ({lockIssueCount})
                    </Typography>
                    {Object.entries(groupedFiles)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .filter(([baliseId]) => {
                        const bId = parseInt(baliseId);
                        const existingData = existingBalises[bId];
                        return (
                          existingData &&
                          (!existingData.locked ||
                            (existingData.lockedBy && existingData.lockedBy !== permissions?.currentUserUid))
                        );
                      })
                      .map(([baliseId]) => {
                        const bId = parseInt(baliseId);
                        const existingData = existingBalises[bId];

                        return (
                          <Box key={baliseId} sx={{ mb: 1.5, pb: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                            <Box
                              sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  Baliisi {baliseId}
                                </Typography>
                                <Chip
                                  label={!existingData.locked ? 'Lukitsematon' : `Lukittu: ${existingData.lockedBy}`}
                                  size="small"
                                  color="warning"
                                  icon={<Warning />}
                                  sx={{ px: 1 }}
                                />
                              </Box>
                              <IconButton size="small" onClick={() => removeBaliseFiles(bId)} edge="end">
                                <Close sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Box>
                          </Box>
                        );
                      })}
                  </Paper>
                )}

                {/* Grouped Files Display */}
                {baliseCount > 0 && (
                  <Paper sx={{ p: 3 }} variant="outlined">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Valitut tiedostot ({validBaliseFileCount} tiedostoa, {baliseCount - lockIssueCount} baliisia)
                      </Typography>
                      {loadingBaliseData && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={16} />
                          <Typography variant="caption" color="text.secondary">
                            Ladataan baliiseja...
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Global Description Field */}
                    <TextField
                      label="Kuvaus kaikille baliiseille"
                      placeholder="Tämä kuvaus lisätään kaikille baliiseille, joille ei ole määritetty omaa kuvausta"
                      value={globalDescription}
                      onChange={(e) => setGlobalDescription(e.target.value)}
                      fullWidth
                      multiline
                      rows={2}
                      sx={{ mb: 3 }}
                      InputLabelProps={{ shrink: true }}
                      required={isSummaryMode}
                      error={!descriptionsValid}
                      helperText={
                        !descriptionsValid
                          ? isSummaryMode
                            ? 'Anna yleinen kuvaus ennen latausta'
                            : 'Anna yleinen kuvaus tai täytä kuvaus kaikille baliiseille'
                          : undefined
                      }
                    />

                    {/* Summary view for large uploads */}
                    {isSummaryMode && (
                      <Box sx={{ py: 2 }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          Yhteenveto ladattavista baliiseista:
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {newBaliseCount > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip label="UUSI" size="small" color="success" icon={<Add />} />
                              <Typography variant="body2">
                                {newBaliseCount} uutta baliisia ({newBaliseFileCount} tiedostoa)
                              </Typography>
                            </Box>
                          )}
                          {updateBaliseCount > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip label="PÄIVITYS" size="small" color="primary" icon={<Update />} />
                              <Typography variant="body2">
                                {updateBaliseCount} päivitettävää baliisia ({updateBaliseFileCount} tiedostoa)
                              </Typography>
                            </Box>
                          )}
                          {lockIssueCount > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip label="ESTETTY" size="small" color="warning" icon={<Lock />} />
                              <Typography variant="body2">
                                {lockIssueCount} estettyä baliisia ({lockedBaliseFileCount} tiedostoa) - lukitsematon
                                tai lukittu toisen käyttäjän toimesta
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Detailed view for smaller uploads */}
                    {!isSummaryMode &&
                      Object.entries(groupedFiles)
                        .filter(([baliseId]) => {
                          const bId = parseInt(baliseId);
                          const existingData = existingBalises[bId];
                          return (
                            !existingData ||
                            (existingData.locked &&
                              (!existingData.lockedBy || existingData.lockedBy === permissions?.currentUserUid))
                          );
                        })
                        .sort(([a], [b]) => parseInt(a) - parseInt(b))
                        .map(([baliseId, baliseFiles]) => {
                          const bId = parseInt(baliseId);
                          const existingData = existingBalises[bId];
                          const isLoadingStatus = loadingBaliseData && !existingData;
                          const isNew = !existingData;
                          const currentDescription = baliseDescriptions[bId] || '';
                          const showFieldError =
                            !globalDescription.trim() && !currentDescription.trim() && requiredBaliseIds.includes(bId);
                          return (
                            <Box key={baliseId} sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  Baliisi {baliseId}
                                </Typography>
                                {isLoadingStatus ? (
                                  <Chip
                                    label="Ladataan..."
                                    size="small"
                                    color="default"
                                    icon={<CircularProgress size={12} />}
                                  />
                                ) : isNew ? (
                                  <Chip label="UUSI" size="small" color="success" icon={<Add />} />
                                ) : (
                                  <Chip
                                    label={`v${existingData.version} → v${existingData.version + 1}`}
                                    size="small"
                                    color="primary"
                                    icon={<Update />}
                                  />
                                )}
                                <Chip label={`${baliseFiles.length} tiedostoa`} size="small" variant="outlined" />
                              </Box>

                              {/* Per-Balise Description Field */}
                              <TextField
                                label={`Kuvaus baliisille ${baliseId}`}
                                value={currentDescription}
                                onChange={(e) =>
                                  setBaliseDescriptions((prev) => ({
                                    ...prev,
                                    [bId]: e.target.value,
                                  }))
                                }
                                fullWidth
                                multiline
                                rows={2}
                                size="small"
                                sx={{ mb: 1 }}
                                placeholder={
                                  globalDescription
                                    ? `Käytetään yleistä kuvausta: "${globalDescription}"`
                                    : 'Lisää kuvaus...'
                                }
                                error={showFieldError}
                                helperText={showFieldError ? 'Anna kuvaus tai käytä yleistä kuvausta' : undefined}
                              />

                              <List dense disablePadding>
                                {baliseFiles.map((file, index) => {
                                  const globalIndex = files.findIndex((f) => f.file === file);
                                  return (
                                    <ListItem
                                      key={index}
                                      sx={{
                                        mb: 0.5,
                                        borderRadius: 1,
                                        border: 1,
                                        borderColor: 'primary.light',
                                        bgcolor: 'primary.lighter',
                                      }}
                                      secondaryAction={
                                        <IconButton size="small" onClick={() => removeFile(globalIndex)} edge="end">
                                          <Close sx={{ fontSize: 18 }} />
                                        </IconButton>
                                      }
                                    >
                                      <Description sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                                      <ListItemText
                                        primary={file.name}
                                        secondary={`${(file.size / 1024).toFixed(1)} KB`}
                                        primaryTypographyProps={{ variant: 'body2' }}
                                        secondaryTypographyProps={{ variant: 'caption' }}
                                      />
                                    </ListItem>
                                  );
                                })}
                              </List>
                            </Box>
                          );
                        })}
                  </Paper>
                )}

                {/* Empty State */}
                {files.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      Ei valittuja tiedostoja. Raahaa tiedostot yllä olevaan alueeseen aloittaaksesi.
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>
    </BalisePermissionGuard>
  );
};

export default BulkUploadPage;
