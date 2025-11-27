import React from 'react';
import { Box, Collapse, Paper } from '@mui/material';
import type { Section } from '../types';
import { SectionFormFields } from './SectionFormFields';

interface ValidationErrors {
  name?: string;
  shortName?: string;
  idRangeMin?: string;
  idRangeMax?: string;
}

interface SectionCreateFormProps {
  isOpen: boolean;
  formData: Partial<Section>;
  onFieldChange: (field: keyof Section, value: string | number) => void;
  onSave: () => void;
  onCancel: () => void;
  validationErrors?: ValidationErrors;
  isLoading?: boolean;
}

export const SectionCreateForm: React.FC<SectionCreateFormProps> = ({
  isOpen,
  formData,
  onFieldChange,
  onSave,
  onCancel,
  validationErrors,
  isLoading = false,
}) => {
  return (
    <Collapse in={isOpen} timeout="auto" unmountOnExit>
      <Paper sx={{ mb: 2 }} variant="outlined">
        <Box sx={{ p: 2 }}>
          <SectionFormFields
            title="Luo uusi rataosa"
            formData={formData}
            onFieldChange={onFieldChange}
            onSave={onSave}
            onCancel={onCancel}
            validationErrors={validationErrors}
            isLoading={isLoading}
          />
        </Box>
      </Paper>
    </Collapse>
  );
};

export default SectionCreateForm;
