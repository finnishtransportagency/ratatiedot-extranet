import React, { useState, useEffect, useCallback } from 'react';
import { Routes } from '../../constants/Routes';
import { downloadBaliseFiles } from '../../utils/download';
import {
  Box,
  Paper,
  Typography,
  Button,
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
import { Tag } from '../../components/Tag';
import { Save, Delete, ArrowBack, ExpandMore, ExpandLess, Lock, LockOpen, Undo } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useBaliseStore } from '../../store/baliseStore';
import { useBalisePermissions } from '../../contexts/BalisePermissionsContext';
import type { Balise, BaliseVersion, BaliseWithHistory } from './types';
import { InlineEditableField } from '../../components/InlineEditableField';
import Circle from '@mui/icons-material/Circle';
import { BaliseFileUpload } from './BaliseFileUpload';

interface BaliseFormProps {
  mode: 'create' | 'view';
  balise?: BaliseWithHistory;
  onSave?: (baliseData: Partial<BaliseWithHistory>, files?: File[], filesToDelete?: string[]) => Promise<void>;
  onCancel?: () => void;
}

interface FormData {
  secondaryId: string;
  description: string;
  files: File[];
}

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

const handleDownloadBaliseFiles = async (
  e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  balise: Balise | BaliseVersion,
) => {
  e.stopPropagation();
  try {
    if (balise.fileTypes.length > 0) {
      await downloadBaliseFiles(
        balise.secondaryId,
        balise.fileTypes,
        balise.version, // Pass the version number
      );
    }
  } catch (error) {
    console.error('Error downloading version files:', error);
  }
};

export const BaliseForm: React.FC<BaliseFormProps> = ({ mode, balise, onSave }) => {
  const navigate = useNavigate();
  const { deleteBalise, lockBalise, unlockBalise } = useBaliseStore();
  const { permissions } = useBalisePermissions();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'locked' | 'already_locked' | 'error' | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saveConfirmDialogOpen, setSaveConfirmDialogOpen] = useState(false);
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

  // Track files marked for deletion
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);

  // Track if there are unsaved changes
  const [hasChanges, setHasChanges] = useState(false);

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

  // Initialize form data and track original values
  useEffect(() => {
    if (balise && mode !== 'create') {
      const initialData = {
        secondaryId: balise.secondaryId.toString(),
        description: balise.description,
        files: [],
      };
      setFormData(initialData);
      setOriginalData({ ...initialData, files: [] }); // Original has no files
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
        formData.files.length > 0;
      setHasChanges(changed);
    }
  }, [formData, originalData, mode]);

  const handleInputChange = useCallback((field: keyof FormData, value: string | File[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const removeFile = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  }, []);

  // Handler for file upload that adds files and marks existing for deletion
  const handleFileUploadMultiple = useCallback(
    (files: File[]) => {
      setFormData((prev) => ({ ...prev, files: [...(prev.files || []), ...files] }));

      // In edit mode with existing files, mark all for deletion (full replacement)
      if (mode !== 'create' && balise && balise.fileTypes.length > 0 && files.length > 0) {
        setFilesToDelete(balise.fileTypes);
        setHasChanges(true);
      }
    },
    [mode, balise],
  );

  // Undo all changes (description + file deletions)
  const handleUndo = useCallback(() => {
    setFormData(originalData);
    setFilesToDelete([]);
    setHasChanges(false);
  }, [originalData]);

  // Open save confirmation dialog
  const handleSaveClick = useCallback(() => {
    setSaveConfirmDialogOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!onSave) return;

    setSaveConfirmDialogOpen(false);
    setLoading(true);
    setError(null);

    try {
      const submitData: Partial<BaliseWithHistory> = {
        secondaryId: parseInt(formData.secondaryId),
        description: formData.description,
      };

      // Pass metadata, files, and files to delete to parent handler
      await onSave(submitData, formData.files, filesToDelete.length > 0 ? filesToDelete : undefined);

      // Update original data after successful save
      setOriginalData({
        secondaryId: formData.secondaryId,
        description: formData.description,
        files: [],
      });

      // Clear the uploaded files from form data since they've been saved
      setFormData((prev) => ({
        ...prev,
        files: [],
      }));

      setFilesToDelete([]);
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Virhe tallentaessa');
    } finally {
      setLoading(false);
    }
  }, [formData, onSave, filesToDelete]);

  const isCreate = mode === 'create';

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
    setErrorType(null);

    try {
      if (balise.locked) {
        await unlockBalise(balise.secondaryId);
      } else {
        await lockBalise(balise.secondaryId);
      }
      // Refresh the page to get updated balise data
      window.location.reload();
    } catch (err) {
      // Try to parse error response for errorType
      if (err instanceof Error) {
        try {
          // Check if the error message is a JSON string from the backend
          const errorData = JSON.parse(err.message);
          if (errorData.errorType) {
            setErrorType(errorData.errorType);
            setError(errorData.error || errorData.message || err.message);
          } else {
            setErrorType('error');
            setError(err.message);
          }
        } catch {
          // Not JSON, just use the message
          setErrorType('error');
          setError(err.message);
        }
      } else {
        setErrorType('error');
        setError(`Failed to ${balise.locked ? 'unlock' : 'lock'} balise`);
      }
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Left: Back button and title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={handleBack} size="small">
                <ArrowBack fontSize="inherit" />
              </IconButton>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6">{isCreate ? 'Luo uusi baliisi' : 'Baliisin tiedot'}</Typography>
                  {balise?.locked && <Tag icon={<Circle />} text="Lukittu" color="default" />}
                </Box>
              </Box>
            </Box>

            {/* Right: Action buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!isCreate && (
                <>
                  {permissions?.canWrite && (
                    <Button
                      variant="outlined"
                      startIcon={balise?.locked ? <LockOpen /> : <Lock />}
                      onClick={handleLockToggle}
                      disabled={actionLoading}
                      size="small"
                      color={balise?.locked ? 'primary' : 'secondary'}
                    >
                      {balise?.locked ? 'Avaa lukitus' : 'Lukitse'}
                    </Button>
                  )}
                  {permissions?.canWrite && (
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
                  )}
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
                        onClick={handleSaveClick}
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
                  size="small"
                >
                  {loading ? 'Tallentaa...' : 'Tallenna'}
                </Button>
              )}
            </Box>
          </Box>

          {error && (
            <Alert
              severity={errorType === 'locked' || errorType === 'already_locked' ? 'info' : 'error'}
              sx={{ mt: 1.5 }}
              onClose={() => {
                setError(null);
                setErrorType(null);
              }}
              icon={errorType === 'locked' || errorType === 'already_locked' ? <Lock fontSize="small" /> : undefined}
            >
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
            <Typography variant="h4" gutterBottom sx={{ mb: 2, fontWeight: 500 }}>
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
              disabled={!permissions?.canWrite}
              multiline
              rows={3}
              placeholder="Syötä kuvaus"
            />
          </Paper>

          <BaliseFileUpload
            isCreate={isCreate}
            balise={balise}
            formData={formData}
            permissions={permissions}
            onFileUpload={handleFileUploadMultiple}
            onRemoveFile={removeFile}
            onDownloadBaliseFiles={handleDownloadBaliseFiles}
          />

          {/* Version History - Admin View */}
          {balise && mode !== 'create' && permissions?.isAdmin && (
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
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'text.primary' }}
                          >
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
                                handleDownloadBaliseFiles(e, version);
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
            <strong>Mitä tapahtuu:</strong>
            <br />
            • Baliisi poistetaan aktiivisesta käytöstä ja siirretään arkistoon
            <br />• Tunniste (ID {balise?.secondaryId}) vapautuu välittömästi uudelleenkäyttöön
            <br />
            • Kaikki versiot ja tiedostot säilyvät arkistossa
            <br />
            • Tiedostot siirretään arkistointipolkuun turvallisesti
            <br />
            <br />
            Poistettua baliisia ei voi palauttaa käyttöön.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={actionLoading}>
            Peruuta
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            {actionLoading ? 'Poistetaan...' : 'Poista'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <Dialog open={saveConfirmDialogOpen} onClose={() => setSaveConfirmDialogOpen(false)}>
        <DialogTitle>Vahvista muutokset</DialogTitle>
        <DialogContent>
          <DialogContentText>Olet tekemässä seuraavat muutokset:</DialogContentText>
          <List>
            {formData.description !== originalData.description && (
              <ListItem>
                <ListItemText
                  primary="Kuvaus päivitetty"
                  secondary={`"${originalData.description}" → "${formData.description}"`}
                />
              </ListItem>
            )}
            {filesToDelete.length > 0 && formData.files.length > 0 && (
              <ListItem>
                <ListItemText
                  primary={`Korvaa ${filesToDelete.length} tiedosto(a) → ${formData.files.length} uudella tiedostolla`}
                  secondary={`Uudet: ${formData.files.map((f) => f.name).join(', ')}`}
                  primaryTypographyProps={{ color: 'warning.main' }}
                />
              </ListItem>
            )}
            {(!filesToDelete.length || filesToDelete.length === 0) && formData.files && formData.files.length > 0 && (
              <ListItem>
                <ListItemText
                  primary={`${formData.files.length} uutta tiedosto(a) lisätään`}
                  secondary={formData.files.map((f) => f.name).join(', ')}
                  primaryTypographyProps={{ color: 'success.main' }}
                />
              </ListItem>
            )}
          </List>
          {filesToDelete.length > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Vanhat tiedostot säilytetään versiohistoriassa ja voidaan palauttaa tarvittaessa.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveConfirmDialogOpen(false)} disabled={loading}>
            Peruuta
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained" disabled={loading}>
            {loading ? 'Tallennetaan...' : 'Tallenna muutokset'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BaliseForm;
