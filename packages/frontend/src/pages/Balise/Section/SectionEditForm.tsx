import React, { useRef, useEffect } from 'react';
import { Box, Collapse, TableRow, TableCell } from '@mui/material';
import type { Section } from '../types';
import { SectionFormFields } from './SectionFormFields';

interface ValidationErrors {
  name?: string;
  shortName?: string;
  idRangeMin?: string;
  idRangeMax?: string;
}

interface SectionEditFormProps {
  section: Section;
  isOpen: boolean;
  formData: Partial<Section>;
  onFieldChange: (field: keyof Section, value: string | number) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  validationErrors?: ValidationErrors;
}

export const SectionEditForm: React.FC<SectionEditFormProps> = ({
  isOpen,
  formData,
  onFieldChange,
  onSave,
  onCancel,
  onDelete,
  validationErrors,
}) => {
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && formRef.current) {
      // Delay to allow the Collapse animation to complete
      const timer = setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <TableRow>
      <TableCell sx={{ pb: 0, pt: 0 }} colSpan={6}>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <Box
            ref={formRef}
            sx={{
              margin: 2,
              scrollMargin: 16,
              backgroundColor: 'background.default',
            }}
          >
            <SectionFormFields
              title={'Muokkaa rataosaa'}
              formData={formData}
              onFieldChange={onFieldChange}
              onSave={onSave}
              onCancel={onCancel}
              onDelete={onDelete}
              validationErrors={validationErrors}
            />
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  );
};

export default SectionEditForm;
