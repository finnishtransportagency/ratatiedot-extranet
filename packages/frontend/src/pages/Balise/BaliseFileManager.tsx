import React, { useCallback } from 'react';
import { Box, Paper, Typography, Button, Alert, Divider } from '@mui/material';
import { Description } from '@mui/icons-material';
import { ChipWrapper } from '../../components/Chip';
import { downloadBaliseFiles } from '../../utils/download';
import { UploadedFilesList } from './components/UploadedFilesList';
import { FileUploadZone } from './components/FileUploadZone';
import { useFileDragDrop } from './hooks/useFileDragDrop';
import type { BaliseWithHistory } from './types';
import { VersionStatus } from './enums';

interface BaliseFileManagerProps {
  isCreate: boolean;
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
  isCreate,
  balise,
  formData,
  permissions,
  onFileUpload,
  onRemoveFile,
}) => {
  const { isDragging, handleDragOver, handleDragLeave, handleDrop } = useFileDragDrop(onFileUpload);

  const handleDownload = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (!balise || balise.fileTypes.length === 0) return;

      try {
        // Backend resolves to correct version (lockedAtVersion for regular users)
        await downloadBaliseFiles(balise.secondaryId, balise.fileTypes);
      } catch (error) {
        console.error('Error downloading files:', error);
      }
    },
    [balise],
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      onFileUpload(files);
      // Clear the input value to allow re-uploading the same file
      event.target.value = '';
    },
    [onFileUpload],
  );

  const hasExistingFiles = balise && balise.fileTypes?.length > 0;
  const hasNewFiles = formData.files.length > 0;
  const canWrite = permissions?.canWrite;

  // Check if balise is properly locked for editing
  const isLockedByCurrentUser =
    isCreate || !balise || (balise.lockedBy && balise.lockedBy === permissions?.currentUserUid); // Locked by current user

  const canUpload = canWrite && isLockedByCurrentUser;
  const showLockWarning = canWrite && !isLockedByCurrentUser;
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
                {fileListLabel} versio {balise?.version}
              </Typography>
              <Button size="small" variant="outlined" color="secondary" onClick={handleDownload}>
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
                    Ladatessasi uudet tiedostot, kaikki {balise?.fileTypes.length} nykyistä tiedostoa korvataan. Vanhat
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
