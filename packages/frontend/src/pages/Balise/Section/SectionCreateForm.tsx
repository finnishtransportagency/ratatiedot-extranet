import React from 'react';
import { Box, Collapse, Paper } from '@mui/material';
import type { Section } from '../types';
import { SectionFormFields } from './SectionFormFields';

interface SectionCreateFormProps {
  isOpen: boolean;
  formData: Partial<Section>;
  onFieldChange: (field: keyof Section, value: string | number) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const SectionCreateForm: React.FC<SectionCreateFormProps> = ({
  isOpen,
  formData,
  onFieldChange,
  onSave,
  onCancel,
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
          />
        </Box>
      </Paper>
    </Collapse>
  );
};

export default SectionCreateForm;
