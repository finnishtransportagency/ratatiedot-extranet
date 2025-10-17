import React, { useState, useEffect, useCallback } from 'react';
import { Routes } from '../../constants/Routes';
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
  Divider,
  ListItemIcon,
} from '@mui/material';
import { Tag } from '../../components/Tag';
import { ChipWrapper } from '../../components/Chip';
import {
  Save,
  Delete,
  ArrowBack,
  ExpandMore,
  ExpandLess,
  Lock,
  LockOpen,
  Undo,
  Description,
  DriveFolderUpload,
  CheckBox,
  DescriptionOutlined,
  CheckBoxOutlineBlank,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useBaliseStore } from '../../store/baliseStore';
import type { BaliseWithHistory } from './types';
import { InlineEditableField } from '../../components/InlineEditableField';
import Circle from '@mui/icons-material/Circle';
import Close from '@mui/icons-material/Close';

interface BaliseFormProps {
  mode: 'create' | 'view';
  balise?: BaliseWithHistory;
  onSave?: (baliseData: Partial<BaliseWithHistory>, files?: File[], filesToDelete?: string[]) => Promise<void>;
  onCancel?: () => void;
}

interface FormData {
  secondaryId: string;
  description: string;
  files?: File[];
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

export const BaliseForm: React.FC<BaliseFormProps> = ({ mode, balise, onSave, onCancel }) => {
  const navigate = useNavigate();
  const { deleteBalise, lockBalise, unlockBalise } = useBaliseStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // Track files to keep (not delete) - when user uploads new files, by default all existing files are marked for deletion
  const [filesToKeep, setFilesToKeep] = useState<string[]>([]);

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
      const dummyFiles: never[] = [];

      const initialData = {
        secondaryId: balise.secondaryId.toString(),
        description: balise.description,
        files: dummyFiles, // TODO: Change back to [] when done testing
      };
      setFormData(initialData);
      setOriginalData({ ...initialData, files: [] }); // Original has no files
      setHasChanges(false);

      // Auto-mark existing files for deletion when dummy files are present
      if (balise.fileTypes && balise.fileTypes.length > 0) {
        setFilesToDelete(balise.fileTypes);
        setFilesToKeep([]);
      }
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

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const items = Array.from(e.dataTransfer.items);
      const allFiles: File[] = [];

      // Helper function to recursively read directory entries
      const readDirectory = async (entry: FileSystemDirectoryEntry): Promise<File[]> => {
        const files: File[] = [];
        const reader = entry.createReader();

        return new Promise((resolve) => {
          const readEntries = () => {
            reader.readEntries(async (entries) => {
              if (entries.length === 0) {
                resolve(files);
                return;
              }

              for (const entry of entries) {
                if (entry.isFile) {
                  const fileEntry = entry as FileSystemFileEntry;
                  const file = await new Promise<File>((resolve) => {
                    fileEntry.file(resolve);
                  });
                  files.push(file);
                } else if (entry.isDirectory) {
                  const dirFiles = await readDirectory(entry as FileSystemDirectoryEntry);
                  files.push(...dirFiles);
                }
              }

              // Read more entries (needed for directories with many files)
              readEntries();
            });
          };

          readEntries();
        });
      };

      // Process all dropped items
      for (const item of items) {
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry();

          if (entry) {
            if (entry.isFile) {
              const file = item.getAsFile();
              if (file) allFiles.push(file);
            } else if (entry.isDirectory) {
              // Recursively read all files from the directory
              const dirFiles = await readDirectory(entry as FileSystemDirectoryEntry);
              allFiles.push(...dirFiles);
            }
          } else {
            // Fallback for browsers that don't support webkitGetAsEntry
            const file = item.getAsFile();
            if (file) allFiles.push(file);
          }
        }
      }

      setFormData((prev) => ({ ...prev, files: [...(prev.files || []), ...allFiles] }));

      // When new files are added in edit mode, mark all existing files for deletion by default
      // User can then choose which ones to keep
      if (mode !== 'create' && balise && balise.fileTypes && balise.fileTypes.length > 0 && allFiles.length > 0) {
        setFilesToDelete(balise.fileTypes);
        setFilesToKeep([]); // None kept by default
        setHasChanges(true);
      }
    },
    [mode, balise],
  );

  const removeFile = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files?.filter((_, i) => i !== index) || [],
    }));
  }, []);

  // Toggle whether to keep an existing file when new files are uploaded
  const toggleFileToKeep = useCallback(
    (fileType: string) => {
      setFilesToKeep((prev) => {
        const newFilesToKeep = prev.includes(fileType) ? prev.filter((f) => f !== fileType) : [...prev, fileType];
        // Update filesToDelete accordingly
        setFilesToDelete(balise?.fileTypes?.filter((ft) => !newFilesToKeep.includes(ft)) || []);
        return newFilesToKeep;
      });
      setHasChanges(true);
    },
    [balise?.fileTypes],
  );

  // Undo all changes (description + file deletions)
  const handleUndo = useCallback(() => {
    setFormData(originalData);
    setFilesToDelete([]);
    setFilesToKeep([]);
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

      // Only add file-related data if new files are being uploaded
      if (formData.files && formData.files.length > 0) {
        // Store full filenames instead of just extensions
        const fileTypes = formData.files.map((file) => file.name);
        // Generate bucket ID automatically: balise_{secondaryId}_{timestamp}
        const bucketId = `balise_${formData.secondaryId}_${Date.now()}`;

        submitData.bucketId = bucketId;
        submitData.fileTypes = fileTypes;
      }

      // Pass metadata, files, and files to delete to parent handler
      await onSave(submitData, formData.files, filesToDelete.length > 0 ? filesToDelete : undefined);

      // Update original data after successful save
      setOriginalData({
        secondaryId: formData.secondaryId,
        description: formData.description,
        files: [],
      });
      setFilesToDelete([]);
      setHasChanges(false);

      navigate(Routes.BALISE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Virhe tallentaessa');
    } finally {
      setLoading(false);
    }
  }, [formData, onSave, navigate, filesToDelete]);

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
              disabled={false}
              multiline
              rows={3}
              placeholder="Syötä kuvaus"
            />
          </Paper>
          <Paper sx={{ p: 3, mb: 2 }} variant="outlined">
            {/* File Management v2024-10-16-13:05 */}
            <Box>
              {/* Show upload area when no files have been added in edit mode */}
              {!isCreate && (!formData.files || formData.files.length === 0) && (
                <Box>
                  {balise && balise.fileTypes && balise.fileTypes.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Nykyiset tiedostot
                        </Typography>
                        <Button size="small" variant="outlined" color="secondary">
                          Lataa tiedostot
                        </Button>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {balise.fileTypes.map((fileType, index) => (
                          <ChipWrapper key={index} text={fileType} icon={<Description />} />
                        ))}
                      </Box>
                    </Box>
                  )}
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
                      bgcolor: isDragging ? 'action.selected' : 'action.hover',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.selected',
                      },
                    }}
                  >
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={handleFileUpload}
                      id="file-upload-input"
                      {...({ webkitdirectory: '', directory: '' } as any)}
                    />
                    <label
                      htmlFor="file-upload-input"
                      style={{
                        cursor: 'pointer',
                        display: 'block',
                        width: '100%',
                      }}
                    >
                      <DriveFolderUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="body1" gutterBottom fontWeight={400} color="text.secondary">
                        Lisää uusia tiedostoja
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        Raahaa kansio tai tiedostot tähän, tai klikkaa valitaksesi
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
                    p: 3,
                    textAlign: 'center',
                    bgcolor: isDragging ? 'action.selected' : 'action.hover',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleFileUpload}
                    id="file-upload-input"
                    {...({ webkitdirectory: '', directory: '' } as any)}
                  />
                  <label
                    htmlFor="file-upload-input"
                    style={{
                      cursor: 'pointer',
                      display: 'block',
                      width: '100%',
                    }}
                  >
                    <DriveFolderUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body1" gutterBottom fontWeight={400} color="text.secondary">
                      Raahaa kansio tai tiedostot tähän
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      Voit raahata koko kansion tai yksittäisiä tiedostoja
                    </Typography>
                  </label>
                </Box>
              )}

              {/* Two-list view when files have been uploaded - both as list items */}
              {!isCreate &&
                formData.files &&
                formData.files.length > 0 &&
                balise &&
                balise.fileTypes &&
                balise.fileTypes.length > 0 && (
                  <Box>
                    <Typography variant="h4" sx={{ mb: 1, fontWeight: 500 }}>
                      Hallitse tiedostoja
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      Valitse säilytettävät tiedostot ja vahvista uudet lisäykset.
                    </Typography>
                    <Divider sx={{ mx: -3, my: 3 }} />

                    {/* List 1: Existing files - marked for deletion by default, click to keep */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h4" sx={{ mb: 1, fontWeight: 500 }}>
                        Nykyiset tiedostot
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        Nykyiset tiedostot poistetaan oletuksena. Klikkaa tiedostoa säilyttääksesi se.
                      </Typography>
                      <List disablePadding>
                        {balise.fileTypes.map((fileType, index) => {
                          const isKept = filesToKeep.includes(fileType);
                          return (
                            <ListItem
                              key={index}
                              onClick={() => toggleFileToKeep(fileType)}
                              sx={{
                                mb: 1,
                                borderRadius: 2,
                                border: 1,
                                borderColor: isKept ? 'primary.light' : 'divider',
                                bgcolor: isKept ? '#eff6ff' : 'divider',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease-in-out',
                                '&:hover': {
                                  bgcolor: isKept ? '#eff6ff' : 'action.hover',
                                  borderColor: isKept ? 'primary.light' : 'action.hover',
                                },
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                {isKept ? (
                                  <CheckBox sx={{ color: 'primary.main', fontSize: 22 }} />
                                ) : (
                                  <CheckBoxOutlineBlank sx={{ color: 'text.disabled', fontSize: 22 }} />
                                )}
                              </ListItemIcon>

                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <DescriptionOutlined sx={{ fontSize: 22 }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={fileType}
                                primaryTypographyProps={{
                                  sx: {
                                    textDecoration: isKept ? 'none' : 'line-through',
                                    color: isKept ? 'text.primary' : 'text.disabled',
                                    fontWeight: isKept ? 500 : 400,
                                  },
                                }}
                              />
                            </ListItem>
                          );
                        })}
                      </List>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* List 2: New uploaded files - will be added to new version */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h4" sx={{ mb: 2, fontWeight: 500 }}>
                        Uudet tiedostot
                      </Typography>
                      <List disablePadding>
                        {formData.files.map((file, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              mb: 1,
                              borderRadius: 2,
                              border: 1,
                              borderColor: '#bbf7d0',
                              bgcolor: '#f0fdf4',
                            }}
                            secondaryAction={
                              <IconButton size="small" onClick={() => removeFile(index)} edge="end">
                                <Close sx={{ fontSize: 20 }} />
                              </IconButton>
                            }
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <DescriptionOutlined sx={{ color: '#2fa34b', fontSize: 22 }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={file.name}
                              secondary={`${(file.size / 1024).toFixed(0)} kB`}
                              primaryTypographyProps={{
                                sx: { fontWeight: 500 },
                              }}
                              secondaryTypographyProps={{
                                sx: { fontSize: '0.75rem' },
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Upload more files section */}
                    <Box>
                      <Typography variant="h4" sx={{ mb: 2, fontWeight: 500 }}>
                        Lisää tiedostoja
                      </Typography>
                      <Box
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        sx={{
                          border: '1px dashed',
                          borderColor: isDragging ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          p: 2,
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
                        <input
                          type="file"
                          hidden
                          multiple
                          onChange={handleFileUpload}
                          id="file-upload-more"
                          {...({ webkitdirectory: '', directory: '' } as any)}
                        />
                        <label
                          htmlFor="file-upload-more"
                          style={{
                            cursor: 'pointer',
                            display: 'block',
                            width: '100%',
                          }}
                        >
                          <DriveFolderUpload sx={{ fontSize: 32, color: 'text.secondary', mb: 0.5 }} />
                          <Typography variant="body2" color="text.disabled">
                            Raahaa lisää tiedostoja tähän tai klikkaa
                          </Typography>
                        </label>
                      </Box>
                    </Box>
                  </Box>
                )}

              {/* Show uploaded files list in create mode */}
              {isCreate && formData.files && formData.files.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.875rem' }}>
                    Valitut tiedostot ({formData.files.length})
                  </Typography>
                  <List dense disablePadding>
                    {formData.files.map((file, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          mb: 0.75,
                          borderRadius: 1,
                          border: 1,
                          borderColor: 'primary.main',
                          bgcolor: 'primary.light',
                        }}
                        secondaryAction={
                          <IconButton size="small" onClick={() => removeFile(index)} edge="end">
                            <Delete sx={{ fontSize: 18, color: 'error.main' }} />
                          </IconButton>
                        }
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Description sx={{ color: 'primary.main', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / 1024).toFixed(0)} kB`}
                          primaryTypographyProps={{
                            sx: { fontSize: '0.875rem', color: 'primary.dark' },
                          }}
                          secondaryTypographyProps={{
                            sx: { fontSize: '0.75rem' },
                          }}
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
              <Typography variant="h4" sx={{ mb: 3 }}>
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
                            <Button
                              size="small"
                              variant="outlined"
                              color="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Download all files for version', version.version);
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
            {filesToDelete.length > 0 && (
              <ListItem>
                <ListItemText
                  primary={`${filesToDelete.length} tiedosto(a) poistetaan`}
                  secondary={filesToDelete.join(', ')}
                  primaryTypographyProps={{ color: 'error' }}
                />
              </ListItem>
            )}
            {formData.files && formData.files.length > 0 && (
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
            <Alert severity="warning" sx={{ mt: 2 }}>
              Huom! Poistetut tiedostot eivät ole palautettavissa.
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
