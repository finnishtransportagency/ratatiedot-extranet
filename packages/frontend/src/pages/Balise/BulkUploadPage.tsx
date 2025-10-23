import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../constants/Routes';
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
} from '@mui/material';
import {
  ArrowBack,
  DriveFolderUpload,
  Close,
  CloudUpload,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  ExpandMore,
  ExpandLess,
  Description,
  Lock,
} from '@mui/icons-material';

interface FileWithBaliseId {
  file: File;
  baliseId: number | null;
  isValid: boolean;
}

interface UploadResult {
  baliseId: number;
  success: boolean;
  newVersion?: number;
  filesUploaded?: number;
  error?: string;
  errorType?: 'locked' | 'not_found' | 'permission' | 'storage' | 'unknown';
  lockedBy?: string;
}

interface UploadResponse {
  success: boolean;
  message: string;
  results: UploadResult[];
  invalidFiles?: string[];
  totalFiles?: number;
  totalBalises?: number;
}

/**
 * Parse balise ID from filename
 * Examples: "10000.il" → 10000, "A-12345.pdf" → 12345
 */
function parseBaliseId(filename: string): number | null {
  const match = filename.match(/(\d+)/);
  if (!match) return null;
  const id = parseInt(match[1], 10);
  return isNaN(id) ? null : id;
}

export const BulkUploadPage: React.FC = () => {
  const navigate = useNavigate();

  const [files, setFiles] = useState<FileWithBaliseId[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedBalises, setExpandedBalises] = useState<Set<number>>(new Set());

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
  }, []);

  const processFiles = (newFiles: File[]) => {
    const processedFiles: FileWithBaliseId[] = newFiles.map((file) => {
      const baliseId = parseBaliseId(file.name);
      return {
        file,
        baliseId,
        isValid: baliseId !== null,
      };
    });

    setFiles((prev) => [...prev, ...processedFiles]);
    setError(null);
    setUploadResult(null);
  };

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    setUploadResult(null);
    setError(null);
  }, []);

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

  const toggleBaliseExpand = (baliseId: number) => {
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
      setError('Ei ladattavia tiedostoja');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setUploadResult(null);

    try {
      // Create FormData with all files
      const formData = new FormData();
      files.forEach((item, index) => {
        if (item.isValid) {
          formData.append(`file-${index}`, item.file);
        }
      });

      // Simulate progress (real progress tracking would require chunked upload or server-sent events)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/balise/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result: UploadResponse = await response.json();
      setUploadResult(result);

      // Auto-expand failed balises
      const failedBaliseIds = result.results.filter((r) => !r.success).map((r) => r.baliseId);
      setExpandedBalises(new Set(failedBaliseIds));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lataus epäonnistui');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleBack = () => {
    navigate(Routes.BALISE);
  };

  const handleUploadAnother = () => {
    clearAll();
  };

  return (
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
              <Typography variant="h6">Balise Massa-lataus</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {files.length > 0 && !uploadResult && (
                <>
                  <Button variant="outlined" onClick={clearAll} disabled={uploading} size="small">
                    Tyhjennä
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
                    onClick={handleUpload}
                    disabled={uploading || validFileCount === 0}
                    size="small"
                  >
                    {uploading ? 'Ladataan...' : `Lataa ${validFileCount} tiedostoa`}
                  </Button>
                </>
              )}
              {uploadResult && (
                <Button variant="contained" color="primary" onClick={handleUploadAnother} size="small">
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
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Upload Progress */}
          {uploading && (
            <Paper sx={{ p: 3, mb: 2 }} variant="outlined">
              <Typography variant="h6" gutterBottom>
                Ladataan tiedostoja...
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {uploadProgress}% valmis
              </Typography>
            </Paper>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <Paper sx={{ p: 3, mb: 2 }} variant="outlined">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                {uploadResult.success ? (
                  <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
                ) : (
                  <Warning sx={{ fontSize: 40, color: 'warning.main' }} />
                )}
                <Box>
                  <Typography variant="h6">{uploadResult.message}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Yhteensä {uploadResult.totalFiles} tiedostoa, {uploadResult.totalBalises} baliisia
                  </Typography>
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

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Tulokset baliseittain:
              </Typography>
              <List dense disablePadding>
                {uploadResult.results.map((result) => (
                  <ListItem
                    key={result.baliseId}
                    sx={{
                      mb: 1,
                      borderRadius: 1,
                      border: 1,
                      borderColor: result.success ? 'success.light' : 'error.light',
                      bgcolor: result.success ? 'success.lighter' : 'error.lighter',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                    }}
                  >
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', width: '100%', cursor: 'pointer' }}
                      onClick={() => toggleBaliseExpand(result.baliseId)}
                    >
                      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        {result.success ? (
                          <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                        ) : result.errorType === 'locked' ? (
                          <Lock sx={{ color: 'warning.main', fontSize: 20 }} />
                        ) : (
                          <ErrorIcon sx={{ color: 'error.main', fontSize: 20 }} />
                        )}
                        <Typography variant="body2" fontWeight={500}>
                          Baliisi {result.baliseId}
                        </Typography>
                        {result.success && (
                          <Chip
                            label={`v${result.newVersion} • ${result.filesUploaded} tiedostoa`}
                            size="small"
                            color="success"
                          />
                        )}
                        {result.errorType === 'locked' && <Chip label="Lukittu" size="small" color="warning" />}
                      </Box>
                      <IconButton size="small">
                        {expandedBalises.has(result.baliseId) ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>
                    <Collapse in={expandedBalises.has(result.baliseId)}>
                      <Box sx={{ mt: 1, pl: 4 }}>
                        {result.error && (
                          <Alert
                            severity={result.errorType === 'locked' ? 'info' : 'error'}
                            sx={{ py: 0.5 }}
                            icon={result.errorType === 'locked' ? <Lock fontSize="small" /> : undefined}
                          >
                            {result.error}
                            {result.lockedBy && (
                              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                Lukituksen voi poistaa käyttäjä {result.lockedBy} tai järjestelmän ylläpitäjä.
                              </Typography>
                            )}
                          </Alert>
                        )}
                      </Box>
                    </Collapse>
                  </ListItem>
                ))}
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
                <input type="file" hidden multiple onChange={handleFileSelect} id="bulk-file-upload" />
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
                    {invalidFiles.length} tiedostoa, joista ei voida tunnistaa baliisi-ID:tä:
                  </Typography>
                  <Typography variant="body2">{invalidFiles.map((f) => f.file.name).join(', ')}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Nämä tiedostot ohitetaan. Varmista, että tiedostonimessä on baliisi-ID (esim. 10000.il).
                  </Typography>
                </Alert>
              )}

              {/* Grouped Files Display */}
              {baliseCount > 0 && (
                <Paper sx={{ p: 3 }} variant="outlined">
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Valitut tiedostot ({validFileCount} tiedostoa, {baliseCount} baliisia)
                    </Typography>
                  </Box>

                  {Object.entries(groupedFiles)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([baliseId, baliseFiles]) => (
                      <Box key={baliseId} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Baliisi {baliseId} ({baliseFiles.length} tiedostoa)
                        </Typography>
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
                                <Description sx={{ color: 'primary.main', fontSize: 20, mr: 1.5 }} />
                                <ListItemText
                                  primary={file.name}
                                  secondary={`${(file.size / 1024).toFixed(1)} KB`}
                                  primaryTypographyProps={{
                                    sx: { fontSize: '0.875rem', fontWeight: 500 },
                                  }}
                                  secondaryTypographyProps={{
                                    sx: { fontSize: '0.75rem' },
                                  }}
                                />
                              </ListItem>
                            );
                          })}
                        </List>
                      </Box>
                    ))}
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
  );
};

export default BulkUploadPage;
