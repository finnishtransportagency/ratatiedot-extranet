import React, { useCallback, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import { DriveFolderUpload, Description, Close, DescriptionOutlined } from '@mui/icons-material';
import { ChipWrapper } from '../../components/Chip';
import type { BaliseWithHistory } from './types';

interface UploadedFilesListProps {
  files: File[];
  title: string;
  onRemoveFile: (index: number) => void;
}

const UploadedFilesList: React.FC<UploadedFilesListProps> = ({ files, title, onRemoveFile }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          fontWeight: 500,
        }}
      >
        {title}
      </Typography>
      <List disablePadding>
        {files.map((file, index) => (
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
              <IconButton size="small" onClick={() => onRemoveFile(index)} edge="end">
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
                sx: {
                  fontWeight: 500,
                },
              }}
              secondaryTypographyProps={{
                sx: { fontSize: '0.75rem' },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

interface FileUploadZoneProps {
  inputId: string;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragging: boolean;
  variant?: 'large' | 'compact';
  title: string;
  subtitle: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  inputId,
  onFileChange,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragging,
  variant = 'large',
  title,
  subtitle,
}) => {
  const isLarge = variant === 'large';

  return (
    <Box
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      sx={{
        border: isLarge ? '2px dashed' : '1px dashed',
        borderColor: isDragging ? 'primary.main' : 'divider',
        borderRadius: isLarge ? 2 : 1,
        p: isLarge ? 3 : 2,
        textAlign: 'center',
        bgcolor: isDragging ? 'action.selected' : isLarge ? 'action.hover' : 'background.paper',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: isLarge ? 'action.selected' : 'action.hover',
        },
      }}
    >
      <input type="file" hidden multiple onChange={onFileChange} id={inputId} />
      <label
        htmlFor={inputId}
        style={{
          cursor: 'pointer',
          display: 'block',
          width: '100%',
        }}
      >
        <DriveFolderUpload sx={{ fontSize: isLarge ? 48 : 32, color: 'text.secondary', mb: isLarge ? 1 : 0.5 }} />
        <Typography
          variant={isLarge ? 'body1' : 'body2'}
          gutterBottom={isLarge}
          fontWeight={isLarge ? 400 : undefined}
          color={isLarge ? 'text.secondary' : 'text.disabled'}
        >
          {title}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {subtitle}
        </Typography>
      </label>
    </Box>
  );
};

interface BaliseFileUploadProps {
  isCreate: boolean;
  balise?: BaliseWithHistory | null;
  formData: { files: File[] };
  permissions?: {
    canWrite: boolean;
    currentUserUid?: string;
  } | null;
  onFileUpload: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onDownloadBaliseFiles?: (e: React.MouseEvent<HTMLButtonElement>, balise: BaliseWithHistory) => void | Promise<void>;
}

export const BaliseFileUpload: React.FC<BaliseFileUploadProps> = ({
  isCreate,
  balise,
  formData,
  permissions,
  onFileUpload,
  onRemoveFile,
  onDownloadBaliseFiles,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      onFileUpload(files);
      // Clear the input value to allow re-uploading the same file
      event.target.value = '';
    },
    [onFileUpload],
  );

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

      onFileUpload(allFiles);
    },
    [onFileUpload],
  );

  const hasExistingFiles = balise && balise.fileTypes?.length > 0;
  const hasNewFiles = formData.files.length > 0;
  const canWrite = permissions?.canWrite;

  // Check if balise is properly locked for editing
  const isLockedByCurrentUser =
    isCreate || !balise || (balise.locked && balise.lockedBy && balise.lockedBy === permissions?.currentUserUid); // Locked by current user

  const canUpload = canWrite && isLockedByCurrentUser;
  const showLockWarning = canWrite && !isLockedByCurrentUser;
  const showContent = hasExistingFiles || canWrite;

  if (!showContent) return null;

  return (
    <Paper sx={{ p: 3, mb: 2 }} variant="outlined">
      <Box>
        {/* Show existing files with download button when no new files uploaded */}
        {!hasNewFiles && hasExistingFiles && (
          <Box sx={{ mb: canWrite ? 2 : 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Nykyiset tiedostot
              </Typography>
              {onDownloadBaliseFiles && (
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={(e) => onDownloadBaliseFiles(e, balise)}
                >
                  Lataa tiedostot
                </Button>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {balise.fileTypes.map((fileType, index) => (
                <ChipWrapper key={index} text={fileType} icon={<Description />} />
              ))}
            </Box>
          </Box>
        )}

        {/* Initial upload zone - shown when no files uploaded yet */}
        {canWrite && !hasNewFiles && (
          <>
            {showLockWarning && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Tiedostojen lisäys estetty
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {!balise?.locked
                    ? 'Lukitse baliisi ennen tiedostojen lisäämistä.'
                    : `Baliisi on lukittu käyttäjän ${balise.lockedBy} toimesta. Vain lukituksen tehnyt käyttäjä voi lisätä tiedostoja.`}
                </Typography>
              </Alert>
            )}
            {canUpload && (
              <FileUploadZone
                inputId="file-upload-input"
                onFileChange={handleFileChange}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                isDragging={isDragging}
                variant="large"
                title={isCreate ? 'Raahaa tiedostot/kansio tähän' : 'Lisää uusia tiedostoja'}
                subtitle={
                  isCreate
                    ? 'Voit valita yksittäisiä tiedostoja tai kokonaisen kansion'
                    : 'Raahaa tiedostot/kansio tähän, tai klikkaa valitaksesi'
                }
              />
            )}
          </>
        )}

        {/* File replacement workflow - shown when files are uploaded */}
        {hasNewFiles && (
          <Box>
            {/* Show different messaging based on whether there are existing files */}
            {hasExistingFiles ? (
              <>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 500 }}>
                  Korvaa tiedostot
                </Typography>
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Uudet tiedostot korvaavat kaikki nykyiset tiedostot
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ladatessasi uudet tiedostot, kaikki {balise.fileTypes.length} nykyistä tiedostoa korvataan. Vanhat
                    tiedostot säilytetään versiohistoriassa.
                  </Typography>
                </Alert>

                <Divider sx={{ my: 3 }} />

                {/* Current files - will be replaced */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Nykyiset tiedostot (korvataan):
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {balise.fileTypes.map((fileType, index) => (
                      <ChipWrapper
                        key={index}
                        text={fileType}
                        icon={<Description />}
                        sx={{
                          textDecoration: 'line-through',
                          opacity: 0.6,
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />
              </>
            ) : (
              <>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 500 }}>
                  Lisää tiedostot
                </Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Lisäät uusia tiedostoja balisille
                  </Typography>
                </Alert>

                <Divider sx={{ my: 3 }} />
              </>
            )}

            {/* New uploaded files - will become the new set */}
            <UploadedFilesList files={formData.files} title="Uudet tiedostot" onRemoveFile={onRemoveFile} />

            <Divider sx={{ my: 3 }} />

            {/* Upload more files section */}
            <Box>
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 500 }}>
                Lisää tiedostoja
              </Typography>
              <FileUploadZone
                inputId="file-upload-more"
                onFileChange={handleFileChange}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                isDragging={isDragging}
                variant="compact"
                title="Raahaa lisää tiedostoja tähän tai klikkaa"
                subtitle=""
              />
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
};
