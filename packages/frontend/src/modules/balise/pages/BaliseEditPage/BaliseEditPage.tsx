import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Alert } from '@mui/material';
import { BaliseForm } from './BaliseForm';
import { useBaliseStore } from '../../store/baliseStore';
import { useBalisePermissions } from '../../contexts/BalisePermissionsContext';
import { BalisePermissionGuard } from '../../components/BalisePermissionGuard';
import type { BaliseWithHistory } from '../../types/baliseTypes';

const fetchBalise = async (secondaryId: string): Promise<BaliseWithHistory> => {
  // API call to get single balise by secondaryId
  const response = await fetch(`/api/balise/${secondaryId}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error(`Baliisin haku epäonnistui`);
  }

  const responseText = await response.text();

  try {
    return JSON.parse(responseText);
  } catch {
    console.error('JSON parse error. Raw response was:', responseText);
    throw new Error(`Baliisin haku epäonnistui`);
  }
};

// Function to handle balise update with optional files
const saveBalise = async (data: Partial<BaliseWithHistory>, files?: File[]): Promise<void> => {
  if (!data.secondaryId) {
    throw new Error('Baliisin ID vaaditaan.');
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
    throw new Error(`Baliisin tallennus epäonnistui.`);
  }
};

export const BaliseEditPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [balise, setBalise] = useState<BaliseWithHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { permissions } = useBalisePermissions();

  // Store action for updating balise in cache
  const { updateBalise: updateBaliseInStore } = useBaliseStore();

  useEffect(() => {
    if (id && permissions?.canRead) {
      loadBalise(id);
    }
  }, [id, permissions?.canRead]);

  const loadBalise = async (baliseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBalise(baliseId);
      setBalise(data);
    } catch (err) {
      console.error(err);
      setError('Baliisin haku epäonnistui');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: Partial<BaliseWithHistory>, files?: File[]) => {
    if (!id) return;

    try {
      let savedBalise: BaliseWithHistory;

      if (files && files.length > 0) {
        // Files uploaded: create new version and replace ALL existing files
        await saveBalise(data, files);
        savedBalise = await fetchBalise(id);
      } else {
        // No files uploaded: update description only (no new version)
        await saveBalise(data);
        savedBalise = await fetchBalise(id);
      }

      // Update both the store cache and local state with the latest data
      updateBaliseInStore(savedBalise);
      setBalise(savedBalise);
    } catch (err) {
      throw err; // Re-throw to let BaliseForm handle the error display
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <BalisePermissionGuard requiredPermission="canRead">
      {error ? (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : (
        <BaliseForm balise={balise} onSave={handleSave} onRefresh={id ? () => loadBalise(id) : undefined} />
      )}
    </BalisePermissionGuard>
  );
};

export default BaliseEditPage;
