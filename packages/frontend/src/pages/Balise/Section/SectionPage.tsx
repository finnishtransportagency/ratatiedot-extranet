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
import { useBalisePermissions } from '../../../contexts/BalisePermissionsContext';
import { BalisePermissionGuard } from '../BalisePermissionGuard';
import type { Section } from '../types';
import { SectionEditForm } from './SectionEditForm';
import { SectionCreateForm } from './SectionCreateForm';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface ValidationErrors {
  name?: string;
  idRangeMin?: string;
  idRangeMax?: string;
}

export const SectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { permissions } = useBalisePermissions();
  const {
    sections,
    error,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    fetchSections,
    createSection,
    updateSection,
    deleteSection,
  } = useSectionStore();
  const [editingSection, setEditingSection] = useState<string | 'new' | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Section>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);

  useEffect(() => {
    if (permissions?.isAdmin) {
      fetchSections();
    }
  }, [fetchSections, permissions?.isAdmin]);

  const handleBack = () => {
    navigate(Routes.BALISE);
  };

  const handleEditSection = (section: Section) => {
    setEditingSection(section.id);
    setEditFormData(section);
  };

  const handleCancelEdit = () => {
    setValidationErrors({});
    setEditingSection(null);
    setEditFormData({});
  };

  const handleSaveSection = async () => {
    // Clear previous validation errors
    setValidationErrors({});

    try {
      if (editingSection === 'new') {
        // Generate key from name
        const key = (editFormData.name || '')
          .toLowerCase()
          .replace(/[^a-z0-9äöå]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');
        await createSection({
          name: editFormData.name || '',
          key,
          description: editFormData.description || '',
          idRangeMin: editFormData.idRangeMin || 0,
          idRangeMax: editFormData.idRangeMax || 0,
        });
      } else if (typeof editingSection === 'string') {
        await updateSection(editingSection, {
          name: editFormData.name,
          description: editFormData.description,
          idRangeMin: editFormData.idRangeMin,
          idRangeMax: editFormData.idRangeMax,
        });
      }
      setEditingSection(null);
      setEditFormData({});
      setValidationErrors({});
    } catch (error) {
      // Error is already handled in the store, just log it
      console.error('Failed to save section:', error);
    }
  };

  const handleDeleteClick = (section: Section) => {
    setSectionToDelete(section);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sectionToDelete) return;

    try {
      await deleteSection(sectionToDelete.id);
      setDeleteDialogOpen(false);
      setSectionToDelete(null);
      // Close edit form if we're deleting the currently edited section
      if (editingSection === sectionToDelete.id) {
        setEditingSection(null);
        setEditFormData({});
        setValidationErrors({});
      }
    } catch (error) {
      // Error is already handled in the store
      console.error('Failed to delete section:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSectionToDelete(null);
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
      description: '',
      idRangeMin: 0,
      idRangeMax: 0,
    };
    setEditingSection('new');
    setEditFormData(newSection);
  };

  return (
    <BalisePermissionGuard requiredPermission="isAdmin">
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
              <Typography variant="h6">JKV-rataosat</Typography>
            </Box>
            <Button variant="contained" size="small" startIcon={<Add />} onClick={handleAddSection}>
              Lisää JKV-rataosa
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            Virhe ladatessa JKV-rataosia: {error}
          </Alert>
        )}

        {/* New section form */}
        <SectionCreateForm
          isOpen={editingSection === 'new'}
          formData={editFormData}
          onFieldChange={handleFieldChange}
          onSave={handleSaveSection}
          onCancel={handleCancelEdit}
          isLoading={isCreating}
          validationErrors={validationErrors}
        />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <CircularProgress />
          </Box>
        ) : sections.length === 0 && !error ? (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'column' }}
          >
            <Typography variant="body1" sx={{ mb: 2 }}>
              JKV-rataosia ei löytynyt
            </Typography>
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
                    <TableCell sx={{ fontSize: '12px', minWidth: 180, padding: '12px 16px', width: '25%' }}>
                      Nimi
                    </TableCell>
                    <TableCell sx={{ fontSize: '12px', minWidth: 240, padding: '12px 16px', width: '35%' }}>
                      Kuvaus
                    </TableCell>
                    <TableCell sx={{ fontSize: '12px', minWidth: 100, padding: '12px 16px', width: '15%' }}>
                      Min ID
                    </TableCell>
                    <TableCell sx={{ fontSize: '12px', minWidth: 100, padding: '12px 16px', width: '15%' }}>
                      Max ID
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: '12px',
                        minWidth: 80,
                        padding: '12px 16px',
                        textAlign: 'center',
                        width: '10%',
                      }}
                    >
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
                        <TableCell sx={{ fontSize: '14px', minWidth: 180, padding: '12px 16px', width: '25%' }}>
                          {section.name}
                        </TableCell>
                        <TableCell sx={{ fontSize: '14px', minWidth: 240, padding: '12px 16px', width: '35%' }}>
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
                        <TableCell sx={{ fontSize: '14px', minWidth: 100, padding: '12px 16px', width: '15%' }}>
                          {section.idRangeMin.toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ fontSize: '14px', minWidth: 100, padding: '12px 16px', width: '15%' }}>
                          {section.idRangeMax.toLocaleString()}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: '14px',
                            minWidth: 80,
                            padding: '12px 16px',
                            textAlign: 'center',
                            width: '10%',
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              editingSection === section.id ? handleCancelEdit() : handleEditSection(section)
                            }
                            title={editingSection === section.id ? 'Peruuta muokkaus' : 'Muokkaa JKV-rataosaa'}
                          >
                            {editingSection === section.id ? (
                              <ExpandLess fontSize="small" />
                            ) : (
                              <Edit fontSize="small" />
                            )}
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
                        onDelete={() => handleDeleteClick(section)}
                        validationErrors={validationErrors}
                        isLoading={isUpdating}
                      />
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialogOpen}
          title="Poista JKV-rataosa"
          message={
            <>
              Haluatko varmasti poistaa JKV-rataosan "{sectionToDelete?.name}"?
              <br />
              <br />
              Tämä toiminto ei ole peruutettavissa.
            </>
          }
          confirmText="Poista"
          confirmColor="error"
          disabled={isDeleting}
          loading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      </Box>
    </BalisePermissionGuard>
  );
};

export default SectionPage;
