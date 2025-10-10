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
  Collapse,
  Divider,
  Avatar,
} from '@mui/material';
import { Save, Cancel, Upload, Download, Delete, Edit, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    secondaryId: '',
    description: '',
    files: [],
  });

  // State for expanded version timeline items
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());

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

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(Routes.BALISE);
    }
  }, [onCancel, navigate]);

  const isCreate = mode === 'create';
  const isEdit = mode === 'edit';
  const isView = mode === 'view';

  const handleEditClick = useCallback(() => {
    if (balise) {
      navigate(`${Routes.BALISE}/${balise.secondaryId}/edit`);
    }
  }, [balise, navigate]);

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
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <IconButton onClick={handleCancel} size="small">
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h6">
                {isCreate ? 'Luo uusi baliisi' : isEdit ? 'Muokkaa baliisia' : 'Baliisi tiedot'}
              </Typography>
              {balise && (
                <Typography variant="caption" color="text.secondary">
                  ID: {balise.secondaryId}
                </Typography>
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
          </Paper>

          {/* File Management */}
          {(isEdit || isCreate) && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Tiedostot
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Button variant="outlined" component="label" startIcon={<Upload />} size="small">
                  Lisää tiedostoja
                  <input type="file" hidden multiple onChange={handleFileUpload} />
                </Button>
              </Box>

              {formData.files && formData.files.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Valitut tiedostot:
                  </Typography>
                  <List dense>
                    {formData.files.map((file, index) => (
                      <ListItem
                        key={index}
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
            </Paper>
          )}

          {/* Version Timeline - Material Design */}
          {balise && mode !== 'create' && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Versiohistoria
              </Typography>

              {/* Timeline - Latest (current) version first, oldest last */}
              <Box sx={{ position: 'relative', mt: 2 }}>
                {/* Vertical line connecting all versions */}
                {balise.history && balise.history.length > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '19px',
                      top: '20px',
                      bottom: '20px',
                      width: '2px',
                      bgcolor: 'divider',
                    }}
                  />
                )}

                {/* Current version (latest) */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, position: 'relative' }}>
                  {/* Timeline dot */}
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: 'primary.main',
                      flexShrink: 0,
                    }}
                  >
                    <Chip label={`v${balise.version || 1}`} size="small" color="primary" />
                  </Avatar>

                  {/* Content */}
                  <Box sx={{ flex: 1, pt: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                      <Chip label={balise.createdBy} size="small" variant="outlined" />
                      <Chip label="Nykyinen versio" size="small" color="success" variant="outlined" />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(balise.createdTime)}
                      </Typography>
                    </Box>

                    {/* Action buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
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
                        sx={{ textTransform: 'none' }}
                      >
                        {expandedVersions.has('current') ? 'Piilota tiedot' : 'Näytä tiedot'}
                      </Button>
                    </Box>

                    <Collapse in={expandedVersions.has('current')}>
                      <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                          Kuvaus:
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1.5 }}>
                          {balise.description || 'Ei kuvausta'}
                        </Typography>
                        {balise.fileTypes && balise.fileTypes.length > 0 && (
                          <>
                            <Divider sx={{ my: 1.5 }} />
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              Tiedostotyypit:
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {balise.fileTypes.map((type, idx) => (
                                  <Chip key={idx} label={type} size="small" />
                                ))}
                              </Box>
                              <Button
                                size="small"
                                startIcon={<Download />}
                                sx={{ textTransform: 'none' }}
                                onClick={() => {
                                  // TODO: Implement download current version files
                                  console.log('Download current version files');
                                }}
                              >
                                Lataa tiedostot
                              </Button>
                            </Box>
                          </>
                        )}
                      </Box>
                    </Collapse>
                  </Box>
                </Box>

                {/* Previous versions from history */}
                {balise.history &&
                  balise.history.map((version, index) => {
                    const isLast = index === balise.history.length - 1;

                    return (
                      <Box key={version.id} sx={{ display: 'flex', gap: 2, mb: isLast ? 0 : 3, position: 'relative' }}>
                        {/* Timeline dot */}
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: 'grey.300',
                            flexShrink: 0,
                          }}
                        >
                          <Typography color="text.secondary">v{version.version || 1}</Typography>
                        </Avatar>

                        {/* Content */}
                        <Box sx={{ flex: 1, pt: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                            <Chip label={version.createdBy} size="small" variant="outlined" />
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(version.createdTime)}
                            </Typography>
                          </Box>

                          {/* Action buttons */}
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
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
                              sx={{ textTransform: 'none' }}
                            >
                              {expandedVersions.has(version.id) ? 'Piilota tiedot' : 'Näytä tiedot'}
                            </Button>
                          </Box>

                          <Collapse in={expandedVersions.has(version.id)}>
                            <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                Kuvaus:
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1.5 }}>
                                {version.description || 'Ei kuvausta'}
                              </Typography>
                              {version.fileTypes && version.fileTypes.length > 0 && (
                                <>
                                  <Divider sx={{ my: 1.5 }} />
                                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                    Tiedostotyypit:
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      flexWrap: 'wrap',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                      {version.fileTypes.map((type, idx) => (
                                        <Chip key={idx} label={type} size="small" />
                                      ))}
                                    </Box>
                                    <Button
                                      size="small"
                                      startIcon={<Download />}
                                      sx={{ textTransform: 'none' }}
                                      onClick={() => {
                                        // TODO: Implement download version files
                                        console.log('Download version', version.version, 'files');
                                      }}
                                    >
                                      Lataa tiedostot
                                    </Button>
                                  </Box>
                                </>
                              )}
                            </Box>
                          </Collapse>
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

          {/* Action Buttons - Material Design pattern: Cancel (left), Primary action (right) */}
          <Paper
            sx={{ p: 2, display: 'flex', justifyContent: 'space-between', position: 'sticky', bottom: 0, zIndex: 1 }}
          >
            <Button variant="outlined" startIcon={<Cancel />} onClick={handleCancel} size="medium">
              Peruuta
            </Button>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {isView && (
                <Button variant="contained" startIcon={<Edit />} onClick={handleEditClick} size="medium">
                  Muokkaa
                </Button>
              )}

              {(isEdit || isCreate) && (
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  onClick={handleSave}
                  disabled={loading || !formData.secondaryId || !formData.description}
                  size="medium"
                >
                  {loading ? 'Tallentaa...' : isEdit ? 'Tallenna muutokset' : 'Luo baliisi'}
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default BaliseForm;
