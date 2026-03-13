import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, IconButton } from '@mui/material';
import { Close, DescriptionOutlined } from '@mui/icons-material';

interface UploadedFilesListProps {
  files: File[];
  title: string;
  onRemoveFile: (index: number) => void;
}

export const UploadedFilesList: React.FC<UploadedFilesListProps> = ({ files, title, onRemoveFile }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          fontWeight: 500,
        }}
      >
        {title}
      </Typography>
      <List disablePadding>
        {files.map((file, index) => (
          <ListItem
            key={index}
            sx={{
              mb: 1,
              borderRadius: 2,
              border: 1,
              borderColor: '#bbf7d0',
              bgcolor: '#f0fdf4',
            }}
            secondaryAction={
              <IconButton size="small" onClick={() => onRemoveFile(index)} edge="end">
                <Close sx={{ fontSize: 20 }} />
              </IconButton>
            }
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <DescriptionOutlined sx={{ color: '#2fa34b', fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText
              primary={file.name}
              secondary={`${(file.size / 1024).toFixed(0)} kB`}
              primaryTypographyProps={{
                sx: {
                  fontWeight: 500,
                },
              }}
              secondaryTypographyProps={{
                sx: { fontSize: '0.75rem' },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
