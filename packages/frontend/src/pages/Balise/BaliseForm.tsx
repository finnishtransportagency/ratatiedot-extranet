import React, { useState, useEffect, useCallback } from 'react';
import { Routes } from '../../constants/Routes';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save,
  Cancel,
  Upload,
  Download,
  Delete,
  Visibility,
  Lock,
  LockOpen,
  FilePresent,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Balise as PrismaBalise, BaliseVersion } from '@prisma/client';

type BaliseWithHistory = PrismaBalise & {
  history: BaliseVersion[];
};

interface BaliseFormProps {
  mode: 'create' | 'edit' | 'view';
  balise?: BaliseWithHistory;
  onSave?: (baliseData: Partial<BaliseWithHistory>) => Promise<void>;
  onCancel?: () => void;
}

interface FormData {
  secondaryId: string;
  description: string;
  bucketId: string;
  fileTypes: string[];
  files?: File[];
  keepPreviousFiles: boolean;
}

const FILE_TYPE_OPTIONS = [
  'PDF',
  'DOC',
  'DOCX',
  'XLS',
  'XLSX',
  'PPT',
  'PPTX',
  'TXT',
  'CSV',
  'JSON',
  'XML',
  'IMG',
  'OTHER',
];

export const BaliseForm: React.FC<BaliseFormProps> = ({ mode, balise, onSave, onCancel }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Check permissions (this would come from your auth context)
  const [permissions] = useState({
    canEdit: true, // This should come from your permission system
    canLock: true,
    canDelete: true,
  });

  const [formData, setFormData] = useState<FormData>({
    secondaryId: '',
    description: '',
    bucketId: '',
    fileTypes: [],
    files: [],
    keepPreviousFiles: true,
  });

  // Initialize form data
  useEffect(() => {
    if (balise && mode !== 'create') {
      setFormData({
        secondaryId: balise.secondaryId.toString(),
        description: balise.description,
        bucketId: balise.bucketId,
        fileTypes: balise.fileTypes,
        files: [],
        keepPreviousFiles: true,
      });
    }
  }, [balise, mode]);

  const handleInputChange = useCallback((field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData((prev) => ({ ...prev, files: [...(prev.files || []), ...files] }));
    setHasChanges(true);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files?.filter((_, i) => i !== index) || [],
    }));
    setHasChanges(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!onSave) return;

    setLoading(true);
    setError(null);

    try {
      const submitData: Partial<BaliseWithHistory> = {
        secondaryId: parseInt(formData.secondaryId),
        description: formData.description,
        bucketId: formData.bucketId,
        fileTypes: formData.fileTypes,
      };

      await onSave(submitData);
      setHasChanges(false);

      if (mode === 'create') {
        navigate(Routes.BALISE);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Virhe tallentaessa');
    } finally {
      setLoading(false);
    }
  }, [formData, onSave, mode, navigate]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(Routes.BALISE);
    }
  }, [onCancel, navigate]);

  const isReadOnly = mode === 'view' || !permissions.canEdit;
  const isCreate = mode === 'create';
  const isEdit = mode === 'edit';

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {isCreate ? 'Luo uusi baliisi' : isEdit ? 'Muokkaa baliisia' : 'Baliisi tiedot'}
          </Typography>
          {balise && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" color="text.secondary">
                ID: {balise.secondaryId}
              </Typography>
              <Chip
                icon={balise.locked ? <Lock /> : <LockOpen />}
                label={balise.locked ? `Lukittu: ${balise.lockedBy}` : 'Ei lukittu'}
                color={balise.locked ? 'error' : 'success'}
                size="small"
              />
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Cancel />} onClick={handleCancel}>
            Peruuta
          </Button>

          {isEdit && (
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} /> : <Save />}
              onClick={handleSubmit}
              disabled={loading || !hasChanges}
            >
              {loading ? 'Tallentaa...' : 'Luo uusi versio'}
            </Button>
          )}

          {isCreate && (
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} /> : <Add />}
              onClick={handleSubmit}
              disabled={loading || !formData.secondaryId || !formData.description}
            >
              {loading ? 'Luodaan...' : 'Luo baliisi'}
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Main Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Perustiedot
        </Typography>

        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: '1fr 1fr' }}>
          <TextField
            label="Baliisi ID"
            value={formData.secondaryId}
            onChange={(e) => handleInputChange('secondaryId', e.target.value)}
            disabled={isReadOnly || (isEdit && !!balise)}
            type="number"
            required
            fullWidth
          />

          <TextField
            label="Bucket ID"
            value={formData.bucketId}
            onChange={(e) => handleInputChange('bucketId', e.target.value)}
            disabled={isReadOnly}
            fullWidth
          />
        </Box>

        <TextField
          label="Kuvaus"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          disabled={isReadOnly}
          multiline
          rows={3}
          fullWidth
          required
          sx={{ mt: 3 }}
        />

        <FormControl fullWidth sx={{ mt: 3 }}>
          <InputLabel>Tiedostotyypit</InputLabel>
          <Select
            multiple
            value={formData.fileTypes}
            onChange={(e) => handleInputChange('fileTypes', e.target.value)}
            disabled={isReadOnly}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {FILE_TYPE_OPTIONS.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* File Management */}
      {(isEdit || isCreate) && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Tiedostot
          </Typography>

          {isEdit && balise && balise.fileTypes.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <FormLabel component="legend" sx={{ mb: 2 }}>
                Aiemmat tiedostot
              </FormLabel>
              <RadioGroup
                value={formData.keepPreviousFiles ? 'keep' : 'replace'}
                onChange={(e) => handleInputChange('keepPreviousFiles', e.target.value === 'keep')}
              >
                <FormControlLabel value="keep" control={<Radio />} label="Säilytä aiemmat tiedostot ja lisää uudet" />
                <FormControlLabel value="replace" control={<Radio />} label="Korvaa kaikki tiedostot uusilla" />
              </RadioGroup>

              {formData.keepPreviousFiles && (
                <Card variant="outlined" sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Nykyiset tiedostot (säilytetään):
                    </Typography>
                    <List dense>
                      {balise.fileTypes.map((type, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <FilePresent />
                          </ListItemIcon>
                          <ListItemText primary={type} />
                          <Tooltip title="Lataa tiedosto">
                            <IconButton size="small">
                              <Download />
                            </IconButton>
                          </Tooltip>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}

          <Box sx={{ mb: 2 }}>
            <Button variant="outlined" component="label" startIcon={<Upload />} disabled={isReadOnly}>
              Lisää tiedostoja
              <input type="file" hidden multiple onChange={handleFileUpload} />
            </Button>
          </Box>

          {formData.files && formData.files.length > 0 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Uudet tiedostot:
                </Typography>
                <List dense>
                  {formData.files.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <FilePresent />
                      </ListItemIcon>
                      <ListItemText primary={file.name} secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`} />
                      <IconButton size="small" onClick={() => removeFile(index)} color="error">
                        <Delete />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Paper>
      )}

      {/* Version History */}
      {balise && balise.history && balise.history.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Versiohistoria
          </Typography>
          <List>
            {balise.history.map((version, index) => (
              <ListItem key={version.id} divider={index < balise.history.length - 1}>
                <ListItemText
                  primary={`Versio ${version.version}`}
                  secondary={
                    <Box>
                      <Typography variant="body2">
                        Luotu: {new Date(version.createdTime).toLocaleString('fi-FI')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Luoja: {version.createdBy}
                      </Typography>
                      {version.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {version.description}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Näytä versio">
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Lataa tiedostot">
                    <IconButton size="small">
                      <Download />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default BaliseForm;
