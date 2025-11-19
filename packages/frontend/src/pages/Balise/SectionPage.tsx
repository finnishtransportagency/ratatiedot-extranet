import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../constants/Routes';
import { useSectionStore } from '../../store/sectionStore';

export const SectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { sections, error, fetchSections } = useSectionStore();

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleBack = () => {
    navigate(Routes.BALISE);
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        mt: 1,
        mb: 1,
        overflow: 'hidden',
        minHeight: 0,
      }}
    >
      {/* Fixed Header with Back button */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
          mb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1 }}>
          <IconButton onClick={handleBack} size="small">
            <ArrowBack fontSize="inherit" />
          </IconButton>
          <Typography variant="h6">Rataosat</Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          Virhe ladatessa rataosia: {error}
        </Alert>
      )}

      {sections.length === 0 && !error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper
          variant="outlined"
          sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}
        >
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
            }}
          >
            <Table size="small" sx={{ tableLayout: 'fixed' }}>
              <TableHead sx={{ position: 'sticky', top: 0, zIndex: 20, backgroundColor: 'background.paper' }}>
                <TableRow sx={{ height: '56px' }}>
                  <TableCell sx={{ fontSize: '12px', width: '200px', padding: '12px 16px' }}>Nimi</TableCell>
                  <TableCell sx={{ fontSize: '12px', width: '100px', padding: '12px 16px' }}>Lyhenne</TableCell>
                  <TableCell sx={{ fontSize: '12px', width: '300px', padding: '12px 16px' }}>Kuvaus</TableCell>
                  <TableCell sx={{ fontSize: '12px', width: '120px', padding: '12px 16px' }}>Min ID</TableCell>
                  <TableCell sx={{ fontSize: '12px', width: '120px', padding: '12px 16px' }}>Max ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ fontSize: '12px' }}>
                {sections.map((section) => (
                  <TableRow key={section.id} hover sx={{ height: '56px' }}>
                    <TableCell sx={{ fontSize: '14px', width: '200px', padding: '12px 16px' }}>
                      {section.name}
                    </TableCell>
                    <TableCell sx={{ fontSize: '14px', width: '100px', padding: '12px 16px' }}>
                      {section.shortName}
                    </TableCell>
                    <TableCell sx={{ fontSize: '14px', width: '300px', padding: '12px 16px' }}>
                      <Typography
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '14px',
                        }}
                      >
                        {section.description}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '14px', width: '120px', padding: '12px 16px' }}>
                      {section.idRangeMin.toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ fontSize: '14px', width: '120px', padding: '12px 16px' }}>
                      {section.idRangeMax.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default SectionPage;
