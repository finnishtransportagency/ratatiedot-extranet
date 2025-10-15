import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Routes } from '../../constants/Routes';
import { Box, CircularProgress, Alert } from '@mui/material';
import { BaliseForm } from './BaliseForm';
import { useBaliseStore } from '../../store/baliseStore';
import type { BaliseWithHistory } from './types';

// Mock API functions - replace with actual API calls
const fetchBalise = async (secondaryId: string): Promise<BaliseWithHistory> => {
  // API call to get single balise by secondaryId
  console.log('Fetching balise with secondaryId:', secondaryId);
  const response = await fetch(`/api/balise/${secondaryId}`);
  console.log('Response status:', response.status);
  console.log('Response headers:', response.headers);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error(`Failed to fetch balise: ${response.status} - ${errorText}`);
  }

  const responseText = await response.text();
  console.log('Raw response:', responseText);

  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    console.error('JSON parse error. Raw response was:', responseText);
    throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
  }
};

const saveBalise = async (data: Partial<BaliseWithHistory>): Promise<BaliseWithHistory> => {
  // API call to create new balise (this would need a proper creation endpoint)
  // For now, using add endpoint with a new secondaryId
  const newSecondaryId = Date.now(); // Temporary ID generation
  const response = await fetch(`/api/balise/${newSecondaryId}/add`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to save balise');
  }
  return response.json();
};

const updateBalise = async (secondaryId: string, data: Partial<BaliseWithHistory>): Promise<BaliseWithHistory> => {
  // API call to update existing balise
  const response = await fetch(`/api/balise/${secondaryId}/add`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update balise');
  }
  return response.json();
};

// Upload a single file to balise
const uploadFileToBalise = async (
  secondaryId: number,
  file: File,
  metadata?: Partial<BaliseWithHistory>,
): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);

  // Include metadata if provided
  if (metadata) {
    formData.append('baliseData', JSON.stringify(metadata));
  }

  const response = await fetch(`/api/balise/${secondaryId}/add`, {
    method: 'PUT',
    body: formData, // No Content-Type header - browser sets it with boundary
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file: ${file.name}`);
  }
};

// Delete individual files from balise
const deleteBaliseFiles = async (secondaryId: number, fileTypes: string[]): Promise<void> => {
  const response = await fetch(`/api/balise/${secondaryId}/files/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileTypes }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete files: ${errorText}`);
  }
};

export const BaliseEditPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [balise, setBalise] = useState<BaliseWithHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store action for updating balise in cache
  const { updateBalise: updateBaliseInStore } = useBaliseStore();

  // Simplified mode: if we have an ID, we're viewing/editing; otherwise creating
  const currentMode = id ? 'view' : 'create';

  useEffect(() => {
    if (id && currentMode !== 'create') {
      loadBalise(id);
    }
  }, [id, currentMode]);

  const loadBalise = async (baliseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBalise(baliseId);
      setBalise(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load balise');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: Partial<BaliseWithHistory>, files?: File[], filesToDelete?: string[]) => {
    try {
      let savedBalise: BaliseWithHistory;

      if (currentMode === 'create') {
        // First, create the balise with metadata only
        savedBalise = await saveBalise(data);

        // Then upload files one by one if any
        if (files && files.length > 0 && savedBalise.secondaryId) {
          for (const file of files) {
            await uploadFileToBalise(savedBalise.secondaryId, file);
          }
        }
      } else if (id) {
        const secondaryId = parseInt(id);

        // If there are files to delete, send deletion request first
        if (filesToDelete && filesToDelete.length > 0) {
          await deleteBaliseFiles(secondaryId, filesToDelete);
        }

        // If there are new files, upload them WITH metadata to create a new version
        if (files && files.length > 0) {
          // Upload first file with metadata to create new version
          await uploadFileToBalise(secondaryId, files[0], data);

          // Upload remaining files (they will be added to the new version)
          for (let i = 1; i < files.length; i++) {
            await uploadFileToBalise(secondaryId, files[i]);
          }

          // Fetch the updated balise to get the latest data
          savedBalise = await fetchBalise(id);
        } else if (filesToDelete && filesToDelete.length > 0) {
          // Only files deleted, no new files - fetch the updated balise
          savedBalise = await fetchBalise(id);
        } else {
          // No files uploaded or deleted, just update metadata
          savedBalise = await updateBalise(id, data);
        }

        // Update the store cache with the latest data
        updateBaliseInStore(savedBalise);
      }

      navigate(Routes.BALISE);
    } catch (err) {
      throw err; // Re-throw to let BaliseForm handle the error display
    }
  };

  const handleCancel = () => {
    navigate(Routes.BALISE);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return <BaliseForm mode={currentMode} balise={balise || undefined} onSave={handleSave} onCancel={handleCancel} />;
};

export default BaliseEditPage;
