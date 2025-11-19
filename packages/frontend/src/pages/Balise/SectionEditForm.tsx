import React from 'react';
import { Box, Typography, TextField, Button, Collapse, TableRow, TableCell } from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import type { Section } from './types';

interface SectionEditFormProps {
  section: Section | null;
  isOpen: boolean;
  formData: Partial<Section>;
  onFieldChange: (field: keyof Section, value: string | number) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const SectionEditForm: React.FC<SectionEditFormProps> = ({
  isOpen,
  formData,
  onFieldChange,
  onSave,
  onCancel,
}) => {
  return (
    <TableRow>
      <TableCell sx={{ pb: 0, pt: 0 }} colSpan={6}>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <Box
            sx={{
              margin: 2,
              backgroundColor: 'background.default',
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ mb: 2, fontWeight: 500 }}>
              Muokkaa rataosaa
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                label="Nimi"
                value={formData.name || ''}
                onChange={(e) => onFieldChange('name', e.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label="Lyhenne"
                value={formData.shortName || ''}
                onChange={(e) => onFieldChange('shortName', e.target.value)}
                fullWidth
                size="small"
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
                value={formData.idRangeMin || ''}
                onChange={(e) => onFieldChange('idRangeMin', parseInt(e.target.value) || 0)}
                fullWidth
                size="small"
              />
              <TextField
                label="Max ID"
                type="number"
                value={formData.idRangeMax || ''}
                onChange={(e) => onFieldChange('idRangeMax', parseInt(e.target.value) || 0)}
                fullWidth
                size="small"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button variant="outlined" size="small" onClick={onCancel} startIcon={<Cancel />}>
                Peruuta
              </Button>
              <Button variant="contained" size="small" onClick={onSave} startIcon={<Save />}>
                Tallenna
              </Button>
            </Box>
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  );
};

export default SectionEditForm;
