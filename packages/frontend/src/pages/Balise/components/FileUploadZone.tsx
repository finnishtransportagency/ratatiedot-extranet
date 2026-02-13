import React from 'react';
import { Box, Typography } from '@mui/material';
import { DriveFolderUpload } from '@mui/icons-material';

interface FileUploadZoneProps {
  inputId: string;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragging: boolean;
  variant?: 'large' | 'compact';
  title: string;
  subtitle: string;
  disabled?: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  inputId,
  onFileChange,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragging,
  variant = 'large',
  title,
  subtitle,
  disabled = false,
}) => {
  const isLarge = variant === 'large';

  return (
    <Box
      onDragOver={disabled ? undefined : onDragOver}
      onDragLeave={disabled ? undefined : onDragLeave}
      onDrop={disabled ? undefined : onDrop}
      sx={{
        border: isLarge ? '2px dashed' : '1px dashed',
        borderColor: disabled ? 'action.disabled' : isDragging ? 'primary.main' : 'divider',
        borderRadius: isLarge ? 2 : 1,
        p: isLarge ? 3 : 2,
        textAlign: 'center',
        bgcolor: disabled
          ? 'action.disabledBackground'
          : isDragging
            ? 'action.selected'
            : isLarge
              ? 'action.hover'
              : 'background.paper',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s ease',
        '&:hover': disabled
          ? {}
          : {
              borderColor: 'primary.main',
              bgcolor: isLarge ? 'action.selected' : 'action.hover',
            },
      }}
    >
      <input type="file" hidden multiple onChange={onFileChange} id={inputId} disabled={disabled} />
      <label
        htmlFor={inputId}
        style={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'block',
          width: '100%',
        }}
      >
        <DriveFolderUpload
          sx={{
            fontSize: isLarge ? 48 : 32,
            color: 'text.secondary',
            mb: isLarge ? 1 : 0.5,
          }}
        />
        <Typography
          variant={isLarge ? 'body1' : 'body2'}
          gutterBottom={isLarge}
          fontWeight={isLarge ? 400 : undefined}
          color={isLarge ? 'text.secondary' : 'text.disabled'}
        >
          {title}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {subtitle}
        </Typography>
      </label>
    </Box>
  );
};
