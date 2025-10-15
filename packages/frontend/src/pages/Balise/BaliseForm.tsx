import React, { useState, useEffect, useCallback } from 'react';
import { Routes } from '../../constants/Routes';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Collapse,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Save,
  Download,
  Delete,
  ArrowBack,
  ExpandMore,
  ExpandLess,
  CloudUpload,
  Lock,
  LockOpen,
  InsertDriveFile,
  Undo,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useBaliseStore } from '../../store/baliseStore';
import type { BaliseWithHistory } from './types';
import { InlineEditableField } from '../../components/InlineEditableField';

interface BaliseFormProps {
  mode: 'create' | 'edit' | 'view';
  balise?: BaliseWithHistory;
  onSave?: (baliseData: Partial<BaliseWithHistory>, files?: File[]) => Promise<void>;
  onCancel?: () => void;
}

interface FormData {
  secondaryId: string;
  description: string;
  files?: File[];
}

// Helper to detect file type from extension
const getFileType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toUpperCase() || 'OTHER';
  return ext;
};

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

export const BaliseForm: React.FC<BaliseFormProps> = ({ mode, balise, onSave, onCancel }) => {
  const navigate = useNavigate();
  const { deleteBalise, lockBalise, unlockBalise } = useBaliseStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    secondaryId: '',
    description: '',
    files: [],
  });

  // Track original data for undo functionality
  const [originalData, setOriginalData] = useState<FormData>({
    secondaryId: '',
    description: '',
    files: [],
  });

  // Track if there are unsaved changes
  const [hasChanges, setHasChanges] = useState(false);

  // State for expanded version timeline items
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());

  // State for drag-and-drop
  const [isDragging, setIsDragging] = useState(false);

  // Helper function to format dates
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('fi-FI', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Initialize form data and track original values
  useEffect(() => {
    if (balise && mode !== 'create') {
      const initialData = {
        secondaryId: balise.secondaryId.toString(),
        description: balise.description,
        files: [],
      };
      setFormData(initialData);
      setOriginalData(initialData);
      setHasChanges(false);
    }
  }, [balise, mode]);

  // Detect changes
  useEffect(() => {
    if (mode === 'create') {
      setHasChanges(formData.secondaryId !== '' || formData.description !== '');
    } else {
      const changed =
        formData.secondaryId !== originalData.secondaryId ||
        formData.description !== originalData.description ||
        !!(formData.files && formData.files.length > 0);
      setHasChanges(changed);
    }
  }, [formData, originalData, mode]);

  const handleInputChange = useCallback((field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData((prev) => ({ ...prev, files: [...(prev.files || []), ...files] }));
  }, []);

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

    const files = Array.from(e.dataTransfer.files);
    setFormData((prev) => ({ ...prev, files: [...(prev.files || []), ...files] }));
  }, []);

  const removeFile = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files?.filter((_, i) => i !== index) || [],
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!onSave) return;

    setLoading(true);
    setError(null);

    try {
      const submitData: Partial<BaliseWithHistory> = {
        secondaryId: parseInt(formData.secondaryId),
        description: formData.description,
      };

      // Only add file-related data if new files are being uploaded
      if (formData.files && formData.files.length > 0) {
        // Auto-detect file types from uploaded files
        const fileTypes = formData.files.map((file) => getFileType(file.name));
        // Generate bucket ID automatically: balise_{secondaryId}_{timestamp}
        const bucketId = `balise_${formData.secondaryId}_${Date.now()}`;

        submitData.bucketId = bucketId;
        submitData.fileTypes = fileTypes;
      }

      // Pass both metadata and files to parent handler
      await onSave(submitData, formData.files);

      // Update original data after successful save
      setOriginalData({
        secondaryId: formData.secondaryId,
        description: formData.description,
        files: [],
      });
      setHasChanges(false);

      navigate(Routes.BALISE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Virhe tallentaessa');
    } finally {
      setLoading(false);
    }
  }, [formData, onSave, navigate]);

  const handleUndo = useCallback(() => {
    setFormData({
      ...originalData,
      files: [], // Don't restore files
    });
    setHasChanges(false);
  }, [originalData]);

  const isCreate = mode === 'create';
  const isEdit = mode === 'edit';
  const isView = mode === 'view';

  const handleBack = useCallback(() => {
    navigate(Routes.BALISE);
  }, [navigate]);

  const handleDeleteClick = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!balise) return;

    setActionLoading(true);
    setError(null);

    try {
      await deleteBalise(balise.secondaryId);
      setDeleteDialogOpen(false);
      navigate(Routes.BALISE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete balise');
    } finally {
      setActionLoading(false);
    }
  }, [balise, deleteBalise, navigate]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleLockToggle = useCallback(async () => {
    if (!balise) return;

    setActionLoading(true);
    setError(null);

    try {
      if (balise.locked) {
        await unlockBalise(balise.secondaryId);
      } else {
        await lockBalise(balise.secondaryId);
      }
      // Refresh the page to get updated balise data
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${balise.locked ? 'unlock' : 'lock'} balise`);
    } finally {
      setActionLoading(false);
    }
  }, [balise, lockBalise, unlockBalise]);

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Fixed Header with Actions */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            {/* Left: Back button and title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={handleBack} size="small">
                <ArrowBack />
              </IconButton>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6">
                    {isCreate ? 'Luo uusi baliisi' : isEdit ? 'Muokkaa baliisia' : 'Baliisi tiedot'}
                  </Typography>
                  {balise?.locked && (
                    <Chip
                      icon={<Lock />}
                      label="Lukittu"
                      size="small"
                      color="warning"
                      sx={{ height: 24, fontSize: '0.75rem' }}
                    />
                  )}
                </Box>
                {balise && (
                  <Typography variant="caption" color="text.secondary">
                    ID: {balise.secondaryId}
                    {balise.locked && balise.lockedBy && ` • Lukittu: ${balise.lockedBy}`}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Right: Action buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {isView && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={balise?.locked ? <LockOpen /> : <Lock />}
                    onClick={handleLockToggle}
                    disabled={actionLoading}
                    size="small"
                    color={balise?.locked ? 'warning' : 'secondary'}
                  >
                    {balise?.locked ? 'Avaa lukitus' : 'Lukitse'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleDeleteClick}
                    disabled={actionLoading}
                    size="small"
                  >
                    Poista
                  </Button>
                  {hasChanges && (
                    <>
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<Undo />}
                        onClick={handleUndo}
                        size="small"
                      >
                        Kumoa
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        onClick={handleSave}
                        disabled={loading || !formData.secondaryId || !formData.description}
                        size="small"
                      >
                        {loading ? 'Tallentaa...' : 'Tallenna'}
                      </Button>
                    </>
                  )}
                </>
              )}

              {isCreate && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  onClick={handleSave}
                  disabled={loading || !formData.secondaryId || !formData.description}
                  size="medium"
                >
                  {loading ? 'Tallentaa...' : 'Tallenna'}
                </Button>
              )}
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 1.5 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </Box>
      </Box>

      {/* Scrollable Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
        }}
      >
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          {/* Main Form */}
          <Paper sx={{ p: 3, mb: 2 }} variant="outlined">
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 500 }}>
              Perustiedot
            </Typography>

            <InlineEditableField
              label="Baliisi ID"
              value={formData.secondaryId}
              onChange={(value) => handleInputChange('secondaryId', value)}
              disabled={!isCreate}
              type="number"
              placeholder="Syötä baliisi ID"
            />

            <InlineEditableField
              label="Kuvaus"
              value={formData.description}
              onChange={(value) => handleInputChange('description', value)}
              disabled={false}
              multiline
              rows={4}
              placeholder="Syötä kuvaus"
            />

            {/* File Management */}
            <Box sx={{ pt: 3, mt: 2, borderTop: 1, borderColor: 'divider' }}>
              {/* Current Files - Always show if balise exists */}
              {!isCreate && balise && balise.fileTypes && balise.fileTypes.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 500 }}>
                      Nykyiset tiedostot
                    </Typography>
                    <Button size="small" color="primary" variant="outlined" startIcon={<Download fontSize="inherit" />}>
                      Lataa kaikki
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {balise.fileTypes.map((fileType, index) => (
                      <Paper
                        key={index}
                        variant="outlined"
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          p: 2,
                          minWidth: '100px',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'action.hover',
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        <InsertDriveFile sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                        <Typography variant="body2" fontWeight="medium">
                          .{fileType}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Drag and Drop Upload Area - Always available */}
              {!isCreate && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Korvaa tiedostot uusilla
                  </Typography>
                  <Box
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    sx={{
                      border: '2px dashed',
                      borderColor: isDragging ? 'primary.main' : 'divider',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      bgcolor: isDragging ? 'action.hover' : 'background.paper',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <input type="file" hidden multiple onChange={handleFileUpload} id="file-upload-input" />
                    <label
                      htmlFor="file-upload-input"
                      style={{
                        cursor: 'pointer',
                        display: 'block',
                        width: '100%',
                      }}
                    >
                      <CloudUpload sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="body2" gutterBottom>
                        Korvaa tiedostot raahaamalla tähän tai klikkaa valitaksesi
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tuetut tiedostotyypit: .il, .leu ja .bis
                      </Typography>
                    </label>
                  </Box>
                </Box>
              )}

              {/* Create Mode Upload Area */}
              {isCreate && (
                <Box
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  sx={{
                    border: '2px dashed',
                    borderColor: isDragging ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    p: 4,
                    mb: 2,
                    textAlign: 'center',
                    bgcolor: isDragging ? 'action.hover' : 'background.paper',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <input type="file" hidden multiple onChange={handleFileUpload} id="file-upload-input" />
                  <label
                    htmlFor="file-upload-input"
                    style={{
                      cursor: 'pointer',
                      display: 'block',
                      width: '100%',
                    }}
                  >
                    <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body1" gutterBottom>
                      Raahaa tiedostot tähän tai klikkaa valitaksesi
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tuetut tiedostotyypit: .il, .leu ja .bis
                    </Typography>
                  </label>
                </Box>
              )}

              {/* New Files List - Show uploaded files that will replace current ones */}
              {formData.files && formData.files.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="primary.main" gutterBottom sx={{ fontWeight: 600 }}>
                    Uudet tiedostot ({formData.files.length}) - Nämä korvaavat nykyiset tiedostot
                  </Typography>
                  <List dense>
                    {formData.files.map((file, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          bgcolor: 'info.light',
                          mb: 0.5,
                          borderRadius: 1,
                          border: 1,
                          borderColor: 'primary.light',
                        }}
                        secondaryAction={
                          <IconButton size="small" onClick={() => removeFile(index)} color="error">
                            <Delete />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB - Tyyppi: ${getFileType(file.name)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Version Timeline - Material Design */}
          {balise && mode !== 'create' && (
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
              <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 600, fontSize: '1.05rem' }}>
                Versiohistoria
              </Typography>

              {/* Combine current version and history for easier mapping */}
              {[balise, ...(balise.history || [])].map((version, index) => {
                const isCurrent = index === 0;
                const isExpanded = expandedVersions.has(isCurrent ? 'current' : version.id);

                return (
                  <Box
                    key={isCurrent ? 'current' : version.id}
                    sx={{
                      display: 'flex',
                      gap: 1.75,
                      position: 'relative',
                      pb: index === balise.history.length ? 0 : 2.5, // Add padding-bottom to all but the last item
                    }}
                  >
                    {/* Vertical timeline line */}
                    {index < balise.history.length && (
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
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'text.primary' }}
                          >
                            v{version.version || 1}
                          </Typography>
                          {isCurrent && (
                            <Chip
                              label="Nykyinen"
                              size="small"
                              sx={{
                                height: '20px',
                                fontSize: '0.75rem',
                                bgcolor: 'info.light',
                                color: 'primary.main',
                                fontWeight: 500,
                                border: 1,
                                borderColor: 'primary.light',
                              }}
                            />
                          )}
                        </Box>
                        <IconButton
                          size="small"
                          sx={{ p: 0.5 }}
                          onClick={() => {
                            const id = isCurrent ? 'current' : version.id;
                            setExpandedVersions((prev) => {
                              const newSet = new Set(prev);
                              newSet.has(id) ? newSet.delete(id) : newSet.add(id);
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
                            <IconButton
                              size="small"
                              sx={{ p: 0.5 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Download all files for version', version.version);
                              }}
                            >
                              <Download fontSize="small" />
                            </IconButton>
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
          )}
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Poista baliisi</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Haluatko varmasti poistaa tämän baliisin (ID: {balise?.secondaryId})?
            <br />
            <br />
            Tämä merkitsee baliisin poistetuksi ja kaikki sen versiot poistetaan. S3-tiedostoja ei poisteta, mutta ne
            voidaan siirtää erilliseen arkistointipalveluun myöhemmin.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={actionLoading}>
            Peruuta
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={actionLoading}>
            {actionLoading ? 'Poistetaan...' : 'Poista'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BaliseForm;
