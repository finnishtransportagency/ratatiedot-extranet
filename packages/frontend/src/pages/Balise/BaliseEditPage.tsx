import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Routes } from '../../constants/Routes';
import { Box, CircularProgress, Alert } from '@mui/material';
import { BaliseForm } from './BaliseForm';
import { useBaliseStore } from '../../store/baliseStore';
import { BalisePermissionGuard } from './BalisePermissionGuard';
import type { BaliseWithHistory } from './types';

// Mock API functions - replace with actual API calls
const fetchBalise = async (secondaryId: string): Promise<BaliseWithHistory> => {
  // API call to get single balise by secondaryId
  const response = await fetch(`/api/balise/${secondaryId}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error(`Failed to fetch balise: ${response.status} - ${errorText}`);
  }

  const responseText = await response.text();

  try {
    return JSON.parse(responseText);
  } catch {
    console.error('JSON parse error. Raw response was:', responseText);
    throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
  }
};

// Unified function to handle balise operations (create/update with optional files)
const saveOrUpdateBalise = async (
  data: Partial<BaliseWithHistory>,
  files?: File[],
  expectResponse: boolean = true,
): Promise<BaliseWithHistory | void> => {
  if (!data.secondaryId) {
    throw new Error('Secondary ID is required to create a balise');
  }

  let response: Response;

  if (files && files.length > 0) {
    // Use FormData for file uploads
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('files', file);
    });

    formData.append('baliseData', JSON.stringify(data));

    response = await fetch(`/api/balise/${data.secondaryId}/add`, {
      method: 'PUT',
      body: formData, // No Content-Type header - browser sets it with boundary
    });
  } else {
    // Use JSON for metadata-only requests
    response = await fetch(`/api/balise/${data.secondaryId}/add`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    const operation = files?.length ? 'upload files to' : 'save';
    throw new Error(`Failed to ${operation} balise: ${errorText}`);
  }

  if (expectResponse) {
    return response.json();
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

  const handleSave = async (data: Partial<BaliseWithHistory>, files?: File[]) => {
    try {
      let savedBalise: BaliseWithHistory;

      if (currentMode === 'create') {
        // For new balise creation
        savedBalise = (await saveOrUpdateBalise(data, files)) as BaliseWithHistory;
        setBalise(savedBalise);

        // Navigate to the newly created balise
        if (savedBalise.secondaryId) {
          navigate(`${Routes.BALISE}/${savedBalise.secondaryId}`);
        }
      } else if (id) {
        if (files && files.length > 0) {
          // Files uploaded: create new version and replace ALL existing files
          await saveOrUpdateBalise(data, files, false); // Don't expect response for file uploads to existing balise
          savedBalise = await fetchBalise(id);
        } else {
          // No files uploaded: update description only (no new version)
          await saveOrUpdateBalise(data, undefined, false); // Don't expect response
          savedBalise = await fetchBalise(id);
        }

        // Update both the store cache and local state with the latest data
        updateBaliseInStore(savedBalise);
        setBalise(savedBalise);
      }
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

  return (
    <BalisePermissionGuard requiredPermission={currentMode === 'create' ? 'canWrite' : 'canRead'}>
      {error ? (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : (
        <BaliseForm mode={currentMode} balise={balise || undefined} onSave={handleSave} onCancel={handleCancel} />
      )}
    </BalisePermissionGuard>
  );
};

export default BaliseEditPage;
