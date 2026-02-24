import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Routes } from '../../constants/Routes';
import {
  isValidBaliseIdRange,
  MIN_BALISE_ID,
  MAX_BALISE_ID,
  getSectionForBaliseId,
} from '../../utils/baliseValidation';
import { useSectionStore } from '../../store/sectionStore';
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
  DialogContentText,
  TextField,
} from '@mui/material';
import { Tag } from '../../components/Tag';
import { Save, Delete, ArrowBack, Lock, LockOpen, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useBaliseStore } from '../../store/baliseStore';
import { useBalisePermissions } from '../../contexts/BalisePermissionsContext';
import type { BaliseWithHistory } from './types';
import { InlineEditableField } from '../../components/InlineEditableField';
import Circle from '@mui/icons-material/Circle';
import { BaliseFileManager } from './BaliseFileManager';
import { BaliseVersionTimeline } from './BaliseVersionTimeline';
import { ConfirmDialog } from './components/ConfirmDialog';
import { DeleteBaliseDialog } from './components/DeleteBaliseDialog';
import { UnlockBaliseDialog } from './components/UnlockBaliseDialog';
import { LockBaliseDialog } from './components/LockBaliseDialog';
import { useBaliseLocking } from './hooks/useBaliseLocking';

interface BaliseFormProps {
  mode: 'create' | 'view';
  balise?: BaliseWithHistory;
  onSave?: (baliseData: Partial<BaliseWithHistory>, files?: File[], filesToDelete?: string[]) => Promise<void>;
  onCancel?: () => void;
  onRefresh?: () => Promise<void>;
}

interface FormData {
  secondaryId: string;
  description: string;
  files: File[];
}

interface BaliseIdHelperTextParams {
  isCreate: boolean;
  secondaryId: string;
  checkingBaliseId: boolean;
  baliseIdExists: boolean | null;
  currentSection?: { name: string };
}

function getBaliseIdHelperText({
  isCreate,
  secondaryId,
  checkingBaliseId,
  baliseIdExists,
  currentSection,
}: BaliseIdHelperTextParams): string | undefined {
  if (!isCreate || secondaryId === '') {
    return currentSection?.name;
  }

  if (checkingBaliseId) {
    return 'Tarkistetaan...';
  }

  if (baliseIdExists === true) {
    return 'Baliisi-ID on jo käytössä';
  }

  const parsedId = parseInt(secondaryId, 10);
  if (parsedId > 0 && !isValidBaliseIdRange(parsedId)) {
    return `Baliisi-ID:n tulee olla välillä ${MIN_BALISE_ID}-${MAX_BALISE_ID}`;
  }

  return currentSection?.name;
}

export const BaliseForm: React.FC<BaliseFormProps> = ({ mode, balise, onSave, onRefresh }) => {
  const navigate = useNavigate();
  const { deleteBalise } = useBaliseStore();
  const { sections, fetchSections } = useSectionStore();
  const { permissions } = useBalisePermissions();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'locked' | 'already_locked' | 'error' | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saveConfirmDialogOpen, setSaveConfirmDialogOpen] = useState(false);
  const [confirmDescription, setConfirmDescription] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Lock/unlock handling
  const {
    lockDialogOpen,
    unlockDialogOpen,
    baliseToLock,
    baliseToUnlock,
    isLocking,
    handleLockToggle,
    handleLockConfirm,
    handleUnlockConfirm,
    handleLockCancel,
    handleUnlockCancel,
  } = useBaliseLocking({
    onSuccess: async () => {
      setError(null);
      setErrorType(null);
      if (onRefresh) await onRefresh();
    },
    onError: (errorMsg, type) => {
      setError(errorMsg);
      setErrorType(type || 'error');
    },
  });

  // Track if the balise ID already exists (for create mode)
  const [baliseIdExists, setBaliseIdExists] = useState<boolean | null>(null);
  const [checkingBaliseId, setCheckingBaliseId] = useState(false);
  const checkBaliseIdTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Fetch sections on mount if not already loaded
  useEffect(() => {
    if (sections.length === 0) {
      fetchSections();
    }
  }, [sections.length, fetchSections]);

  // Compute which section the current balise ID belongs to
  const currentSection = useMemo(() => {
    const baliseId = parseInt(formData.secondaryId, 10);
    if (isNaN(baliseId) || baliseId <= 0) return undefined;
    return getSectionForBaliseId(baliseId, sections);
  }, [formData.secondaryId, sections]);

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

  // Check if balise ID already exists (debounced, for create mode only)
  useEffect(() => {
    if (mode !== 'create') return;

    // Clear previous timeout
    if (checkBaliseIdTimeout.current) {
      clearTimeout(checkBaliseIdTimeout.current);
    }

    const parsedId = parseInt(formData.secondaryId, 10);
    if (!formData.secondaryId || isNaN(parsedId) || !isValidBaliseIdRange(parsedId)) {
      setBaliseIdExists(null);
      setCheckingBaliseId(false);
      return;
    }

    setCheckingBaliseId(true);

    // Debounce the API call
    checkBaliseIdTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/balise/${parsedId}`);
        setBaliseIdExists(response.ok); // 200 = exists, 404 = doesn't exist
      } catch {
        setBaliseIdExists(null);
      } finally {
        setCheckingBaliseId(false);
      }
    }, 500);

    return () => {
      if (checkBaliseIdTimeout.current) {
        clearTimeout(checkBaliseIdTimeout.current);
      }
    };
  }, [mode, formData.secondaryId]);

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
    // If the user already changed the description in the form, prefill the
    // confirm description so they don't need to retype it. Otherwise leave
    // it empty to force explicit entry.
    if (formData.description !== originalData.description) {
      setConfirmDescription(formData.description);
    } else {
      setConfirmDescription('');
    }
    setSaveConfirmDialogOpen(true);
  }, [formData.description, originalData.description]);

  const handleSave = useCallback(async () => {
    if (!onSave) return;

    setSaveConfirmDialogOpen(false);
    setLoading(true);
    setError(null);

    try {
      const descriptionToUse = confirmDescription.trim() !== '' ? confirmDescription.trim() : formData.description;

      const submitData: Partial<BaliseWithHistory> = {
        secondaryId: parseInt(formData.secondaryId),
        description: descriptionToUse,
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
      setConfirmDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Virhe tallentaessa');
    } finally {
      setLoading(false);
    }
  }, [formData, onSave, filesToDelete, confirmDescription]);

  const isCreate = mode === 'create';
  const needsConfirmDescription = formData.files.length > 0;

  const handleBack = useCallback(() => {
    navigate(Routes.BALISE);
  }, [navigate]);

  const handleDeleteClick = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!balise) return;

    setDeleteLoading(true);
    setError(null);

    try {
      await deleteBalise(balise.secondaryId);
      setDeleteDialogOpen(false);
      navigate(Routes.BALISE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete balise');
    } finally {
      setDeleteLoading(false);
    }
  }, [balise, deleteBalise, navigate]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

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
                      startIcon={
                        isLocking ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : balise?.locked ? (
                          <LockOpen />
                        ) : (
                          <Lock />
                        )
                      }
                      onClick={() => balise && handleLockToggle(balise)}
                      disabled={isLocking}
                      size="small"
                      color={balise?.locked ? 'primary' : 'secondary'}
                    >
                      {isLocking
                        ? balise?.locked
                          ? 'Avataan...'
                          : 'Lukitaan...'
                        : balise?.locked
                          ? 'Avaa lukitus'
                          : 'Lukitse'}
                    </Button>
                  )}
                  {permissions?.isAdmin && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={handleDeleteClick}
                      disabled={deleteLoading}
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
                        startIcon={<Cancel />}
                        onClick={handleUndo}
                        size="small"
                      >
                        Peruuta
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        onClick={handleSaveClick}
                        disabled={loading || !formData.secondaryId || !formData.description}
                        size="small"
                      >
                        {loading ? 'Tallennetaan...' : 'Tallenna'}
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
                  disabled={
                    loading ||
                    !formData.secondaryId ||
                    !formData.description ||
                    checkingBaliseId ||
                    baliseIdExists === true ||
                    !isValidBaliseIdRange(parseInt(formData.secondaryId, 10))
                  }
                  size="small"
                >
                  {loading ? 'Tallennetaan...' : 'Tallenna'}
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
          {/* Lock Info Section */}
          {balise?.locked && (
            <Paper variant="outlined" sx={{ mb: 2, p: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Lock fontSize="small" color="action" sx={{ mt: 0.25 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Lukittu: {balise.lockedBy}
                  {balise.lockedTime && <> ({new Date(balise.lockedTime).toLocaleString('fi-FI')})</>}
                </Typography>
                {balise.lockReason && (
                  <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                    {balise.lockReason}
                  </Typography>
                )}
              </Box>
            </Paper>
          )}

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
              required
              error={
                isCreate &&
                formData.secondaryId !== '' &&
                (baliseIdExists === true ||
                  (parseInt(formData.secondaryId, 10) > 0 && !isValidBaliseIdRange(parseInt(formData.secondaryId, 10))))
              }
              helperText={getBaliseIdHelperText({
                isCreate,
                secondaryId: formData.secondaryId,
                checkingBaliseId,
                baliseIdExists,
                currentSection,
              })}
            />

            <InlineEditableField
              label="Kuvaus"
              value={formData.description}
              onChange={(value) => handleInputChange('description', value)}
              disabled={
                !permissions?.canWrite ||
                (mode !== 'create' &&
                  !!balise &&
                  (!balise.locked || (!!balise.lockedBy && balise.lockedBy !== permissions?.currentUserUid)))
              }
              multiline
              rows={3}
              placeholder="Syötä kuvaus"
              required
            />
          </Paper>

          <BaliseFileManager
            isCreate={isCreate}
            balise={balise}
            formData={formData}
            targetBaliseId={formData.secondaryId ? parseInt(formData.secondaryId, 10) || null : null}
            baliseIdExists={baliseIdExists}
            checkingBaliseId={checkingBaliseId}
            permissions={permissions}
            onFileUpload={handleFileUploadMultiple}
            onRemoveFile={removeFile}
          />

          {/* Version Timeline - Unified timeline showing historical and draft versions */}
          {balise && mode !== 'create' && (permissions?.isAdmin || balise.lockedBy === permissions?.currentUserUid) && (
            <BaliseVersionTimeline balise={balise} permissions={permissions} />
          )}
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <DeleteBaliseDialog
        open={deleteDialogOpen}
        secondaryId={balise?.secondaryId}
        disabled={deleteLoading}
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Save Confirmation Dialog */}
      <ConfirmDialog
        open={saveConfirmDialogOpen}
        title="Vahvista muutokset"
        message={
          <>
            <DialogContentText>Olet tekemässä seuraavat muutokset:</DialogContentText>
            <List>
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
              {formData.description !== originalData.description && !needsConfirmDescription && (
                <ListItem>
                  <ListItemText
                    primary="Kuvaus päivitetty"
                    secondary={`"${originalData.description}" → "${formData.description}"`}
                  />
                </ListItem>
              )}
              {needsConfirmDescription && (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    label="Syötä uusi kuvaus"
                    value={confirmDescription}
                    onChange={(e) => setConfirmDescription(e.target.value)}
                    required
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Box>
              )}
            </List>

            {filesToDelete.length > 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Vanhat tiedostot säilytetään versiohistoriassa ja voidaan palauttaa tarvittaessa.
              </Alert>
            )}
          </>
        }
        confirmText="Tallenna muutokset"
        confirmColor="primary"
        disabled={loading || (needsConfirmDescription && confirmDescription.trim() === '')}
        loading={loading}
        onConfirm={handleSave}
        onCancel={() => {
          setSaveConfirmDialogOpen(false);
          setConfirmDescription('');
        }}
      />

      {/* Unlock Confirmation Dialog */}
      <UnlockBaliseDialog
        open={unlockDialogOpen}
        version={baliseToUnlock?.version}
        disabled={isLocking}
        loading={isLocking}
        onConfirm={handleUnlockConfirm}
        onCancel={handleUnlockCancel}
      />

      {/* Lock Reason Dialog */}
      <LockBaliseDialog
        open={lockDialogOpen}
        baliseId={baliseToLock?.secondaryId}
        loading={isLocking}
        onConfirm={handleLockConfirm}
        onCancel={handleLockCancel}
      />
    </Box>
  );
};

export default BaliseForm;
