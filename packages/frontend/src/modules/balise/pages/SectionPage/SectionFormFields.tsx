import React from 'react';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { Save, Cancel, Delete } from '@mui/icons-material';
import type { Section } from '../../types/baliseTypes';
import { getRangesForSectionPrefix } from '../../utils/baliseValidation';
import { useSectionStore } from '../../store/sectionStore';

interface ValidationErrors {
  name?: string;
  sectionPrefix?: string;
}

interface SectionFormFieldsProps {
  title: string;
  formData: Partial<Section>;
  onFieldChange: (field: keyof Section, value: string | number) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  validationErrors?: ValidationErrors;
  isLoading?: boolean;
  isOpen?: boolean;
  editingSectionId?: string | null;
}

export const SectionFormFields: React.FC<SectionFormFieldsProps> = ({
  title,
  formData,
  onFieldChange,
  onSave,
  onCancel,
  onDelete,
  validationErrors,
  isLoading = false,
  isOpen = true,
  editingSectionId,
}) => {
  const { sections } = useSectionStore();

  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!formData.name?.trim()) {
      errors.name = 'Nimi on pakollinen';
    } else if (sections.some((s) => s.name === formData.name?.trim() && s.id !== editingSectionId)) {
      errors.name = 'Rataosan nimen tulee olla uniikki';
    }

    const prefix = formData.sectionPrefix;
    if (!prefix || !Number.isInteger(prefix) || prefix < 9 || prefix > 99) {
      errors.sectionPrefix = 'Rataosan numeron tulee olla kokonaisluku välillä 9-99';
    } else if (sections.some((s) => s.sectionPrefix === prefix && s.id !== editingSectionId)) {
      errors.sectionPrefix = 'Rataosan numeron tulee olla uniikki';
    }

    return errors;
  };

  const currentErrors = isOpen ? { ...validateForm(), ...validationErrors } : {};
  const hasErrors = Object.keys(currentErrors).length > 0;

  const handleSave = () => {
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      onSave();
    }
  };

  // Compute range preview
  const rangePreview =
    formData.sectionPrefix && formData.sectionPrefix >= 9 && formData.sectionPrefix <= 99
      ? getRangesForSectionPrefix(formData.sectionPrefix)
          .map((r) => `${r.min}–${r.max}`)
          .join(', ')
      : '';

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ mb: 2, fontWeight: 500 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2, mb: 2 }}>
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
          label="Rataosan numero"
          type="number"
          value={formData.sectionPrefix ?? ''}
          onChange={(e) =>
            onFieldChange('sectionPrefix', e.target.value ? parseInt(e.target.value) : ('' as unknown as number))
          }
          fullWidth
          size="small"
          required
          error={!!currentErrors.sectionPrefix}
          helperText={currentErrors.sectionPrefix || (rangePreview && `Baliisit: ${rangePreview}`)}
          inputProps={{ min: 9, max: 99 }}
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
      </Box>
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        {onDelete && (
          <Button
            variant="outlined"
            size="small"
            onClick={onDelete}
            startIcon={<Delete />}
            disabled={isLoading}
            color="error"
          >
            Poista
          </Button>
        )}
        <Button
          variant="outlined"
          size="small"
          onClick={onCancel}
          startIcon={<Cancel />}
          disabled={isLoading}
          color="secondary"
        >
          Peruuta
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={handleSave}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <Save />}
          disabled={hasErrors || isLoading}
        >
          {isLoading ? 'Tallennetaan...' : 'Tallenna'}
        </Button>
      </Box>
    </>
  );
};

export default SectionFormFields;
