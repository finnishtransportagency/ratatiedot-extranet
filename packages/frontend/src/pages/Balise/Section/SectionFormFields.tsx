import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import type { Section } from '../types';

interface ValidationErrors {
  name?: string;
  shortName?: string;
  idRangeMin?: string;
  idRangeMax?: string;
}

interface SectionFormFieldsProps {
  title: string;
  formData: Partial<Section>;
  onFieldChange: (field: keyof Section, value: string | number) => void;
  onSave: () => void;
  onCancel: () => void;
  validationErrors?: ValidationErrors;
}

export const SectionFormFields: React.FC<SectionFormFieldsProps> = ({
  title,
  formData,
  onFieldChange,
  onSave,
  onCancel,
  validationErrors = {},
}) => {
  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!formData.name?.trim()) {
      errors.name = 'Nimi on pakollinen';
    }

    if (!formData.shortName?.trim()) {
      errors.shortName = 'Lyhenne on pakollinen';
    }

    if (formData.idRangeMin === undefined || formData.idRangeMin === null) {
      errors.idRangeMin = 'Min ID on pakollinen';
    }

    if (formData.idRangeMax === undefined || formData.idRangeMax === null) {
      errors.idRangeMax = 'Max ID on pakollinen';
    }

    if (
      formData.idRangeMin !== undefined &&
      formData.idRangeMax !== undefined &&
      formData.idRangeMin >= formData.idRangeMax
    ) {
      errors.idRangeMin = 'Min ID tulee olla pienempi kuin Max ID';
      errors.idRangeMax = 'Max ID tulee olla suurempi kuin Min ID';
    }

    return errors;
  };

  const currentErrors = { ...validateForm(), ...validationErrors };
  const hasErrors = Object.keys(currentErrors).length > 0;

  const handleSave = () => {
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      onSave();
    }
  };
  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ mb: 2, fontWeight: 500 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
        <TextField
          label="Nimi"
          value={formData.name || ''}
          onChange={(e) => onFieldChange('name', e.target.value)}
          fullWidth
          size="small"
          required
          error={!!currentErrors.name}
          helperText={currentErrors.name}
        />
        <TextField
          label="Lyhenne"
          value={formData.shortName || ''}
          onChange={(e) => onFieldChange('shortName', e.target.value)}
          fullWidth
          size="small"
          required
          error={!!currentErrors.shortName}
          helperText={currentErrors.shortName}
        />
        <TextField
          label="Kuvaus"
          value={formData.description || ''}
          onChange={(e) => onFieldChange('description', e.target.value)}
          fullWidth
          size="small"
          sx={{ gridColumn: '1 / -1' }}
          multiline
          rows={3}
        />
        <TextField
          label="Min ID"
          type="number"
          value={formData.idRangeMin ?? ''}
          onChange={(e) => onFieldChange('idRangeMin', e.target.value ? parseInt(e.target.value) : 0)}
          fullWidth
          size="small"
          required
          error={!!currentErrors.idRangeMin}
          helperText={currentErrors.idRangeMin}
        />
        <TextField
          label="Max ID"
          type="number"
          value={formData.idRangeMax ?? ''}
          onChange={(e) => onFieldChange('idRangeMax', e.target.value ? parseInt(e.target.value) : 0)}
          fullWidth
          size="small"
          required
          error={!!currentErrors.idRangeMax}
          helperText={currentErrors.idRangeMax}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button variant="outlined" size="small" onClick={onCancel} startIcon={<Cancel />}>
          Peruuta
        </Button>
        <Button variant="contained" size="small" onClick={handleSave} startIcon={<Save />} disabled={hasErrors}>
          Tallenna
        </Button>
      </Box>
    </>
  );
};

export default SectionFormFields;
