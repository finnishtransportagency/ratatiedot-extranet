import { Box, Button, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getCategoryRouteName } from '../../routes';
import { ButtonWrapper } from '../../styles/common';
import { theme } from '../../styles/createTheme';
import { ListModal } from '../Modal/ListModal';
import { FolderList } from './FolderList';

interface Component {
  categoryComponentId: string;
  title: string;
  alfrescoNodeId: string;
}

interface FoldersProps {
  isEditing: boolean;
}

export const Folders = ({ isEditing }: FoldersProps) => {
  const [components, setComponents] = useState([]);
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [isNewList, setIsNewList] = useState(false);
  const categoryName = getCategoryRouteName(useLocation());

  const getComponents = async () => {
    try {
      const response: any = await axios.get(`/api/database/components/${categoryName}`);
      setComponents(response.data.map((component: any) => component.node));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getComponents();
  }, []);

  const resetState = () => {};

  const addList = async (title: string) => {
    try {
      const response = await axios.post(`/api/alfresco/folder/${categoryName}`, {
        name: title,
        nodeType: 'cm:folder',
        properties: {
          'cm:title': title,
          'cm:description': '',
        },
      });
      setOpen(false);
      setSuccess(true);
      getComponents();
      return response;
    } catch (error) {
      setError(true);
    }
    resetState();
  };

  const editList = async (component: Component | null, title: string) => {
    try {
      const response = await axios.put(`/api/alfresco/folder/${categoryName}/${component?.categoryComponentId}`, {
        name: title,
        properties: {
          'cm:title': title,
          'cm:description': '',
        },
      });
      setOpen(false);
      setSuccess(true);
      getComponents();
      return response;
    } catch (error) {
      setError(true);
    }
  };

  const deleteComponent = async (component: Component) => {
    try {
      const response = await axios.delete(`/api/alfresco/folder/${categoryName}/${component?.alfrescoNodeId}`);
      if (response) {
        setOpen(false);
      }
      setOpen(false);
      setSuccess(true);
      getComponents();
      return response;
    } catch (error) {
      setError(true);
    }
  };

  const openDialog = () => {
    setTitle('');
    setIsNewList(true);
    setOpen(true);
  };

  const handleSnackbarClose = () => {
    setError(false);
    setSuccess(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const openEditModal = (component: Component) => {
    setIsNewList(false);
    setSelectedComponent(component);
    setTitle(component.title);
    setOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', width: '100%', marginLeft: theme.spacing(5) }}>
      {components.map((component: any) => (
        <FolderList
          title={component.title}
          isEditing={isEditing}
          parentNode={component}
          onEdit={(node) => openEditModal(node)}
        ></FolderList>
      ))}
      <Button onClick={() => openDialog()}>{t('common:list.add_list')}</Button>
      <ListModal
        open={open}
        onSnackbarClose={handleSnackbarClose}
        handleClose={handleClose}
        title={isNewList ? t('common:list.add_list') : t('common:list.edit_list')}
        success={success}
        error={error}
        children={
          <Box component="form">
            <Typography variant="body1">Otsikko</Typography>
            <TextField fullWidth onChange={(e) => setTitle(e.target.value)} defaultValue={title}></TextField>
            <Box sx={{ display: 'flex' }}>
              {selectedComponent && !isNewList && (
                <ButtonWrapper onClick={() => deleteComponent(selectedComponent)}>
                  {t('common:action.delete')}
                </ButtonWrapper>
              )}
              <ButtonWrapper sx={{ marginLeft: 'auto' }} color="primary" variant="text" onClick={() => handleClose()}>
                {t('common:action.cancel')}
              </ButtonWrapper>
              {isNewList ? (
                <ButtonWrapper color="primary" variant="contained" onClick={() => addList(title)}>
                  {t('common:action.add')}
                </ButtonWrapper>
              ) : (
                <ButtonWrapper color="primary" variant="contained" onClick={() => editList(selectedComponent, title)}>
                  {t('common:edit.edit')}
                </ButtonWrapper>
              )}
            </Box>
          </Box>
        }
      ></ListModal>
    </Box>
  );
};
