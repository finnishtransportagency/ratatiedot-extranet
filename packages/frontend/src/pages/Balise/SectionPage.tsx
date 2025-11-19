import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export const SectionPage: React.FC = () => {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 2,
      }}
    >
      <Paper
        sx={{
          p: 3,
          textAlign: 'center',
        }}
        variant="outlined"
      >
        <Typography variant="h4" gutterBottom>
          Rataosat
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Rataosien hallintasivu tulossa pian...
        </Typography>
      </Paper>
    </Box>
  );
};

export default SectionPage;
