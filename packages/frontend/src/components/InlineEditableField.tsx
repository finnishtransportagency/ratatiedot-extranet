import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Typography } from '@mui/material';

interface InlineEditableFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  type?: 'text' | 'number';
  placeholder?: string;
}

/**
 * Inline editable field component
 * Shows as plain text until clicked, then shows editable input
 */
export const InlineEditableField: React.FC<InlineEditableFieldProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  multiline = false,
  rows = 4,
  type = 'text',
  placeholder = 'Klikkaa muokataksesi...',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text when entering edit mode
      if (inputRef.current instanceof HTMLInputElement || inputRef.current instanceof HTMLTextAreaElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    // Don't call onChange here anymore - we do it on every change
  };

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue); // Call onChange immediately
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setLocalValue(value); // Revert to original value
    }
  };

  if (disabled || !isEditing) {
    return (
      <Box
        onClick={() => !disabled && setIsEditing(true)}
        sx={{
          py: 1.5,
          px: 1,
          cursor: disabled ? 'default' : 'pointer',
          borderRadius: 1,
          transition: 'background-color 0.2s',
          '&:hover': disabled
            ? {}
            : {
                bgcolor: 'action.hover',
              },
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            mb: 0.5,
            display: 'block',
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: value ? 'text.primary' : 'text.disabled',
            whiteSpace: multiline ? 'pre-wrap' : 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: multiline ? '32px' : 'auto',
          }}
        >
          {value || placeholder}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 1, px: 1 }}>
      <TextField
        inputRef={inputRef}
        label={label}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        multiline={multiline}
        rows={rows}
        type={type}
        fullWidth
        size="small"
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.paper',
          },
        }}
      />
    </Box>
  );
};
