import React, { useState, useEffect, useCallback } from 'react';
import { Routes } from '../../constants/Routes';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
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
  Edit,
  ArrowBack,
  ExpandMore,
  ExpandLess,
  CloudUpload,
  Lock,
  LockOpen,
  InsertDriveFile,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useBaliseStore } from '../../store/baliseStore';
import type { BaliseWithHistory } from './types';

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

  // Initialize form data
  useEffect(() => {
    if (balise && mode !== 'create') {
      setFormData({
        secondaryId: balise.secondaryId.toString(),
        description: balise.description,
        files: [],
      });
    }
  }, [balise, mode]);

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
      // Auto-detect file types from uploaded files
      const fileTypes = formData.files?.map((file) => getFileType(file.name)) || [];

      // Generate bucket ID automatically: balise_{secondaryId}_{timestamp}
      const bucketId = `balise_${formData.secondaryId}_${Date.now()}`;

      const submitData: Partial<BaliseWithHistory> = {
        secondaryId: parseInt(formData.secondaryId),
        description: formData.description,
        bucketId,
        fileTypes,
      };

      // Pass both metadata and files to parent handler
      await onSave(submitData, formData.files);
      navigate(Routes.BALISE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Virhe tallentaessa');
    } finally {
      setLoading(false);
    }
  }, [formData, onSave, navigate]);

  const isCreate = mode === 'create';
  const isEdit = mode === 'edit';
  const isView = mode === 'view';

  const handleBack = useCallback(() => {
    if (balise && isEdit) {
      navigate(`${Routes.BALISE}/${balise.secondaryId}/view`);
    } else {
      navigate(Routes.BALISE);
    }
  }, [balise, isEdit, navigate]);

  const handleEditClick = useCallback(() => {
    if (balise) {
      navigate(`${Routes.BALISE}/${balise.secondaryId}/edit`);
    }
  }, [balise, navigate]);

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
                    size="medium"
                    color={balise?.locked ? 'warning' : 'primary'}
                  >
                    {balise?.locked ? 'Avaa lukitus' : 'Lukitse'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleDeleteClick}
                    disabled={actionLoading}
                    size="medium"
                  >
                    Poista
                  </Button>
                  <Button variant="contained" startIcon={<Edit />} onClick={handleEditClick} size="medium">
                    Muokkaa
                  </Button>
                </>
              )}

              {(isEdit || isCreate) && (
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
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Perustiedot
            </Typography>

            <TextField
              label="Baliisi ID"
              value={formData.secondaryId}
              onChange={(e) => handleInputChange('secondaryId', e.target.value)}
              disabled={isView || (isEdit && !!balise)}
              type="number"
              required
              fullWidth
              size="small"
              sx={{ mb: 2 }}
            />

            <TextField
              label="Kuvaus"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isView}
              multiline
              rows={4}
              fullWidth
              required
              size="small"
            />
            {/* File Management */}
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Tiedostot
                </Typography>
                {!isEdit && !isCreate && (
                  <Box sx={{ margin: 'auto 0 auto 0' }}>
                    <Button size="small" color="primary" startIcon={<Download fontSize="inherit" />}>
                      Lataa
                    </Button>
                  </Box>
                )}
              </Box>
              {/* View mode: Show current file types from database */}
              {isView && balise && balise.fileTypes && balise.fileTypes.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {balise.fileTypes.map((fileType, index) => (
                    <Paper
                      variant="outlined"
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: 3,
                        minWidth: '36px',
                      }}
                    >
                      <InsertDriveFile key={index} sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                      <Typography>.{fileType}</Typography>
                    </Paper>
                  ))}
                </Box>
              )}
              {/* Edit/Create mode: Drag-and-drop upload area */}
              {(isEdit || isCreate) && (
                <>
                  {/* Drag and Drop Area */}
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
                      position: 'relative',
                    }}
                  >
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      id="file-upload-input"
                    />
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

                  {/* Selected Files List */}
                  {formData.files && formData.files.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Valitut tiedostot ({formData.files.length}):
                      </Typography>
                      <List dense>
                        {formData.files.map((file, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              bgcolor: 'background.paper',
                              mb: 0.5,
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                            secondaryAction={
                              <IconButton size="small" onClick={() => removeFile(index)} color="error">
                                <Delete />
                              </IconButton>
                            }
                          >
                            <ListItemText
                              primary={file.name}
                              secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB - Tyyppi: ${getFileType(
                                file.name,
                              )}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Paper>

          {/* Version Timeline - Material Design */}
          {balise && mode !== 'create' && (
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Versiohistoria
              </Typography>

              {/* Timeline - Latest (current) version first, oldest last */}
              <Box sx={{ position: 'relative', mt: 2 }}>
                {/* Vertical line connecting all versions */}
                {balise.history && balise.history.length > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '9px',
                      top: '30px',
                      bottom: '20px',
                      width: '2px',
                      bgcolor: 'primary.main',
                      opacity: 0.3,
                    }}
                  />
                )}

                {/* Current version (latest) */}
                <Box sx={{ display: 'flex', gap: 2, mb: 1.5, position: 'relative' }}>
                  {/* Timeline dot */}
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mt: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                      }}
                    />
                  </Box>

                  {/* Version card */}
                  <Box
                    sx={{
                      flex: 1,
                      bgcolor: 'white',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    }}
                  >
                    {/* Card content */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        p: 1.5,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'grey.50',
                        },
                      }}
                      onClick={() => {
                        setExpandedVersions((prev) => {
                          const newSet = new Set(prev);
                          if (newSet.has('current')) {
                            newSet.delete('current');
                          } else {
                            newSet.add('current');
                          }
                          return newSet;
                        });
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                            v{balise.version || 1}
                          </Typography>
                          <Chip label="Nykyinen" size="small" color="primary" sx={{ height: 18, fontSize: '0.7rem' }} />
                        </Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mb: 0.75, fontSize: '0.75rem' }}
                        >
                          Muokannut {balise.createdBy}, {formatDate(balise.createdTime)}
                        </Typography>

                        {/* Description - show snippet or full based on expanded state */}
                        {!expandedVersions.has('current') ? (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75, fontSize: '0.85rem' }}>
                            {(balise.description || 'Ei kuvausta').substring(0, 60)}
                            {(balise.description || '').length > 60 && '...'}
                          </Typography>
                        ) : (
                          <Typography variant="body2" sx={{ mb: 1.5, fontSize: '0.85rem' }}>
                            {balise.description || 'Ei kuvausta'}
                          </Typography>
                        )}

                        {/* Files - show count and download all button */}
                        {balise.fileTypes && balise.fileTypes.length > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              {balise.fileTypes.length} tiedosto{balise.fileTypes.length > 1 ? 'a' : ''}:{' '}
                              {balise.fileTypes.join(', ')}
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<Download />}
                              variant="outlined"
                              sx={{
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                py: 0.25,
                                px: 1,
                                minHeight: 0,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Download all files for current version');
                              }}
                            >
                              Lataa tiedostot
                            </Button>
                          </Box>
                        )}
                      </Box>

                      <IconButton size="small" sx={{ mt: -0.5, p: 0.5 }}>
                        {expandedVersions.has('current') ? (
                          <ExpandLess fontSize="small" />
                        ) : (
                          <ExpandMore fontSize="small" />
                        )}
                      </IconButton>
                    </Box>
                  </Box>
                </Box>

                {/* Previous versions from history */}
                {balise.history &&
                  balise.history.map((version, index) => {
                    const isLast = index === balise.history.length - 1;

                    return (
                      <Box
                        key={version.id}
                        sx={{ display: 'flex', gap: 2, mb: isLast ? 0 : 1.5, position: 'relative' }}
                      >
                        {/* Timeline line connecting dots */}
                        {index === 0 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              left: '9px',
                              top: -12,
                              width: 2,
                              height: isLast ? 'calc(100% + 12px)' : 'calc(100% + 24px)',
                              bgcolor: 'primary.main',
                              opacity: 0.3,
                            }}
                          />
                        )}

                        {/* Timeline dot */}
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mt: 1.5,
                            zIndex: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                            }}
                          />
                        </Box>

                        {/* Version card */}
                        <Box
                          sx={{
                            flex: 1,
                            bgcolor: 'white',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                          }}
                        >
                          {/* Card content */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              p: 1.5,
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: 'grey.50',
                              },
                            }}
                            onClick={() => {
                              setExpandedVersions((prev) => {
                                const newSet = new Set(prev);
                                if (newSet.has(version.id)) {
                                  newSet.delete(version.id);
                                } else {
                                  newSet.add(version.id);
                                }
                                return newSet;
                              });
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                  v{version.version || 1}
                                </Typography>
                              </Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                sx={{ mb: 0.75, fontSize: '0.75rem' }}
                              >
                                Muokannut {version.createdBy}, {formatDate(version.createdTime)}
                              </Typography>

                              {/* Description - show snippet or full based on expanded state */}
                              {!expandedVersions.has(version.id) ? (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 0.75, fontSize: '0.85rem' }}
                                >
                                  {(version.description || 'Ei kuvausta').substring(0, 60)}
                                  {(version.description || '').length > 60 && '...'}
                                </Typography>
                              ) : (
                                <Typography variant="body2" sx={{ mb: 1.5, fontSize: '0.85rem' }}>
                                  {version.description || 'Ei kuvausta'}
                                </Typography>
                              )}

                              {/* Files - show count and download all button */}
                              {version.fileTypes && version.fileTypes.length > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                    {version.fileTypes.length} tiedosto{version.fileTypes.length > 1 ? 'a' : ''}:{' '}
                                    {version.fileTypes.join(', ')}
                                  </Typography>
                                  <Button
                                    size="small"
                                    startIcon={<Download />}
                                    variant="outlined"
                                    sx={{
                                      textTransform: 'none',
                                      fontSize: '0.75rem',
                                      py: 0.25,
                                      px: 1,
                                      minHeight: 0,
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log('Download all files for version', version.version);
                                    }}
                                  >
                                    Lataa tiedostot
                                  </Button>
                                </Box>
                              )}
                            </Box>

                            <IconButton size="small" sx={{ mt: -0.5, p: 0.5 }}>
                              {expandedVersions.has(version.id) ? (
                                <ExpandLess fontSize="small" />
                              ) : (
                                <ExpandMore fontSize="small" />
                              )}
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
              </Box>
            </Paper>
          )}

          {/* Developer Debug Panel */}
          {balise && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Kehittäjätiedot
              </Typography>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: 'white',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  maxHeight: 200,
                  overflow: 'auto',
                  position: 'relative',
                }}
              >
                <Button
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    minWidth: 'auto',
                    textTransform: 'none',
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(balise, null, 2));
                  }}
                >
                  Kopioi
                </Button>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {JSON.stringify(balise, null, 2)}
                </pre>
              </Box>
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
