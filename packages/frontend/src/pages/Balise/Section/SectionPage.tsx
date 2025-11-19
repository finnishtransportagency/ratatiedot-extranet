import React, { useEffect, useState } from 'react';
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
  Button,
} from '@mui/material';
import { ArrowBack, Edit, ExpandLess, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../../constants/Routes';
import { useSectionStore } from '../../../store/sectionStore';
import type { Section } from '../types';
import { SectionEditForm } from './SectionEditForm';
import { SectionCreateForm } from './SectionCreateForm';

export const SectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { sections, error, fetchSections } = useSectionStore();
  const [editingSection, setEditingSection] = useState<string | 'new' | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Section>>({});

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleBack = () => {
    navigate(Routes.BALISE);
  };

  const handleEditSection = (section: Section) => {
    setEditingSection(section.id);
    setEditFormData(section);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditFormData({});
  };

  const handleSaveSection = async () => {
    // TODO: Implement save functionality with API call
    if (editingSection === 'new') {
      console.log('Creating new section:', editFormData);
      // TODO: Call API to create new section
    } else {
      console.log('Updating section:', editFormData);
      // TODO: Call API to update existing section
    }
    setEditingSection(null);
    setEditFormData({});
  };

  const handleFieldChange = (field: keyof Section, value: string | number) => {
    setEditFormData((prev: Partial<Section>) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddSection = () => {
    const newSection: Partial<Section> = {
      name: '',
      shortName: '',
      description: '',
      idRangeMin: 0,
      idRangeMax: 0,
      key: '',
    };
    setEditingSection('new');
    setEditFormData(newSection);
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, px: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleBack} size="small">
              <ArrowBack fontSize="inherit" />
            </IconButton>
            <Typography variant="h6">Rataosat</Typography>
          </Box>
          <Button variant="contained" size="small" startIcon={<Add />} onClick={handleAddSection}>
            Lisää rataosa
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          Virhe ladatessa rataosia: {error}
        </Alert>
      )}

      {/* New section form */}
      <SectionCreateForm
        isOpen={editingSection === 'new'}
        formData={editFormData}
        onFieldChange={handleFieldChange}
        onSave={handleSaveSection}
        onCancel={handleCancelEdit}
      />

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
                  <TableCell sx={{ fontSize: '12px', width: '80px', padding: '12px 16px', textAlign: 'center' }}>
                    Muokkaa
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ fontSize: '12px' }}>
                {sections.map((section) => (
                  <React.Fragment key={section.id}>
                    <TableRow
                      hover={editingSection !== section.id}
                      sx={{
                        height: '56px',
                        backgroundColor: editingSection === section.id ? 'action.selected' : 'inherit',
                      }}
                    >
                      {' '}
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
                      <TableCell sx={{ fontSize: '14px', width: '80px', padding: '12px 16px', textAlign: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            editingSection === section.id ? handleCancelEdit() : handleEditSection(section)
                          }
                          title={editingSection === section.id ? 'Peruuta muokkaus' : 'Muokkaa rataosaa'}
                        >
                          {editingSection === section.id ? <ExpandLess fontSize="small" /> : <Edit fontSize="small" />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <SectionEditForm
                      section={section}
                      isOpen={editingSection === section.id}
                      formData={editFormData}
                      onFieldChange={handleFieldChange}
                      onSave={handleSaveSection}
                      onCancel={handleCancelEdit}
                    />
                  </React.Fragment>
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
