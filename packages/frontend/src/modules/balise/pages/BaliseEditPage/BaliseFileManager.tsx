import React, { useCallback, useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Alert, Divider, List, ListItem, ListItemText } from '@mui/material';
import { Description, Download } from '@mui/icons-material';
import { ChipWrapper } from '../../../../components/Chip';
import { scheduleBaliseDownloads } from '../../utils/baliseDownload';
import { validateBaliseFiles, getValidExtensionsList } from '../../utils/baliseValidation';
import { UploadedFilesList } from './UploadedFilesList';
import { FileUploadZone } from './FileUploadZone';
import { useFileDragDrop } from '../../hooks/useFileDragDrop';
import type { BaliseWithHistory } from '../../types/baliseTypes';
import { VersionStatus } from '../../constants/enums';

interface FileValidationError {
  filename: string;
  errors: string[];
}

interface BaliseFileManagerProps {
  balise?: BaliseWithHistory | null;
  formData: { files: File[] };
  permissions?: {
    canWrite: boolean;
    isAdmin?: boolean;
    currentUserUid?: string;
  } | null;
  onFileUpload: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
}

export const BaliseFileManager: React.FC<BaliseFileManagerProps> = ({
  balise,
  formData,
  permissions,
  onFileUpload,
  onRemoveFile,
}) => {
  const [validationErrors, setValidationErrors] = useState<FileValidationError[]>();

  // Clear validation errors when files are cleared (e.g., undo button)
  useEffect(() => {
    if (formData.files.length === 0) {
      setValidationErrors([]);
    }
  }, [formData.files.length]);

  // Validate files before passing to parent handler
  const handleValidatedFileUpload = useCallback(
    (files: File[]) => {
      if (!balise) return;

      const { validFiles, invalidFiles } = validateBaliseFiles(files, balise.secondaryId);

      // Set validation errors for display
      if (invalidFiles.length > 0) {
        setValidationErrors(
          invalidFiles.map(({ file, errors }) => ({
            filename: file.name,
            errors,
          })),
        );
      } else {
        setValidationErrors([]);
      }

      // Pass only valid files to parent
      if (validFiles.length > 0) {
        onFileUpload(validFiles);
      }
    },
    [balise, onFileUpload],
  );

  const { isDragging, handleDragOver, handleDragLeave, handleDrop } = useFileDragDrop(handleValidatedFileUpload);

  const handleDownload = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (!balise || balise.fileTypes.length === 0) return;

      try {
        // Only pass explicit version if user is viewing draft
        const version = balise.versionStatus === VersionStatus.UNCONFIRMED ? balise.version : undefined;

        await scheduleBaliseDownloads([{ secondaryId: balise.secondaryId, version }]);
      } catch (error) {
        console.error('Error downloading files:', error);
      }
    },
    [balise],
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      handleValidatedFileUpload(files);
      // Clear the input value to allow re-uploading the same file
      event.target.value = '';
    },
    [handleValidatedFileUpload],
  );

  // Wrapper for file removal - useEffect handles clearing validation errors when files become empty
  const handleRemoveFile = useCallback(
    (index: number) => {
      onRemoveFile(index);
    },
    [onRemoveFile],
  );

  const hasExistingFiles = balise && balise.fileTypes?.length > 0;
  const hasNewFiles = formData.files.length > 0;
  const canWrite = permissions?.canWrite;

  // Check if balise is properly locked for editing
  const isLockedByCurrentUser = !balise || (balise.lockedBy && balise.lockedBy === permissions?.currentUserUid); // Locked by current user
  const isLockedByOther = balise?.locked && balise.lockedBy && balise.lockedBy !== permissions?.currentUserUid;

  const canUpload = canWrite && isLockedByCurrentUser;
  const showLockWarning = canWrite && isLockedByOther;
  const showContent = hasExistingFiles || canWrite;

  // Label for file list
  let fileListLabel = 'Nykyiset tiedostot';
  if (balise && balise.versionStatus === VersionStatus.UNCONFIRMED) {
    fileListLabel = 'Luonnoksen tiedostot';
  }

  if (!showContent) return null;

  return (
    <Paper sx={{ p: 3, mb: 2 }} variant="outlined">
      <Box>
        {/* Show existing files with download button when no new files uploaded */}
        {!hasNewFiles && hasExistingFiles && (
          <Box sx={{ mb: canWrite ? 2 : 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {fileListLabel}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                startIcon={<Download />}
                onClick={handleDownload}
              >
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

        {/* Initial upload zone - shown when no files uploaded yet */}
        {canWrite && !hasNewFiles && (
          <>
            {showLockWarning && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Tiedostojen lisäys estetty
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {`Baliisi on lukittu käyttäjän ${balise.lockedBy} toimesta. Vain lukituksen tehnyt käyttäjä voi lisätä tiedostoja.`}
                </Typography>
              </Alert>
            )}
            {canUpload && (
              <>
                {/* Validation errors - show rejected files when no valid files uploaded */}
                {validationErrors && validationErrors.length > 0 && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Tiedostot hylättiin
                    </Typography>
                    {validationErrors.length > 10 ? (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {validationErrors.length} tiedostoa hylättiin. Hyväksytty muoto: {'{'}
                        ID{'}'}.pääte tai {'{'}ID{'}'}K.pääte ({getValidExtensionsList()})
                      </Typography>
                    ) : (
                      <List dense sx={{ py: 0 }}>
                        {validationErrors.map((err, idx) => (
                          <ListItem key={idx} sx={{ py: 0.25, px: 0 }}>
                            <ListItemText
                              primary={err.filename}
                              secondary={err.errors.join('. ')}
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Alert>
                )}
                <FileUploadZone
                  inputId="file-upload-input"
                  onFileChange={handleFileChange}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  isDragging={isDragging}
                  variant="large"
                  title="Lisää uusia tiedostoja"
                  subtitle={`Sallitut tiedostopäätteet: ${getValidExtensionsList()}`}
                />
              </>
            )}
          </>
        )}

        {/* File replacement workflow - shown when files are uploaded */}
        {hasNewFiles && (
          <Box>
            {/* Validation errors - show rejected files */}
            {validationErrors && validationErrors.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Osa tiedostoista hylättiin
                </Typography>
                {validationErrors.length > 10 ? (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {validationErrors.length} tiedostoa hylättiin. Hyväksytty muoto: {'{'}
                    ID{'}'}.pääte tai {'{'}ID{'}'}K.pääte ({getValidExtensionsList()})
                  </Typography>
                ) : (
                  <List dense sx={{ py: 0 }}>
                    {validationErrors.map((err, idx) => (
                      <ListItem key={idx} sx={{ py: 0.25, px: 0 }}>
                        <ListItemText
                          primary={err.filename}
                          secondary={err.errors.join('. ')}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Alert>
            )}

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
                    Lisätessäsi uusia tiedostoja, kaikki {balise?.fileTypes.length} nykyistä tiedostoa korvataan. Vanhat
                    tiedostot säilytetään versiohistoriassa.
                  </Typography>
                </Alert>

                <Divider sx={{ my: 3 }} />

                {/* Current files - will be replaced */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {fileListLabel} (korvataan)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {balise?.fileTypes.map((fileType, index) => (
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
                    Lisäät uusia tiedostoja baliisille
                  </Typography>
                </Alert>

                <Divider sx={{ my: 3 }} />
              </>
            )}

            {/* New uploaded files - will become the new set */}
            <UploadedFilesList files={formData.files} title="Uudet tiedostot" onRemoveFile={handleRemoveFile} />

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
                subtitle={`Sallitut päätteet: ${getValidExtensionsList()}`}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
};
