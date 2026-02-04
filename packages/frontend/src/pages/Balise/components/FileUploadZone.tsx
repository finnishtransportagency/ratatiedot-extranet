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
}) => {
  const isLarge = variant === 'large';

  return (
    <Box
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      sx={{
        border: isLarge ? '2px dashed' : '1px dashed',
        borderColor: isDragging ? 'primary.main' : 'divider',
        borderRadius: isLarge ? 2 : 1,
        p: isLarge ? 3 : 2,
        textAlign: 'center',
        bgcolor: isDragging ? 'action.selected' : isLarge ? 'action.hover' : 'background.paper',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: isLarge ? 'action.selected' : 'action.hover',
        },
      }}
    >
      <input type="file" hidden multiple onChange={onFileChange} id={inputId} />
      <label
        htmlFor={inputId}
        style={{
          cursor: 'pointer',
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
