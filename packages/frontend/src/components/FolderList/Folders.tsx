import { Box, Button, TextField, Typography } from '@mui/material';
import axios, { AxiosResponse } from 'axios';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getCategoryRouteName } from '../../routes';
import { ButtonWrapper } from '../../styles/common';
import { theme } from '../../styles/createTheme';
import { Modal } from '../Modal/Modal';
import { FolderList } from './FolderList';
import { Node } from './FolderList';

interface Component {
  node: Node;
}

interface FoldersProps {
  isEditing: boolean;
}

export const Folders = ({ isEditing }: FoldersProps) => {
  const [nodes, setNodes] = useState([]);
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<Node | null>(null);
  const [isNewList, setIsNewList] = useState(false);
  const categoryName = getCategoryRouteName(useLocation());

  const getComponents = async () => {
    try {
      const response: AxiosResponse = await axios.get(`/api/database/components/${categoryName}`);
      setNodes(response.data.map((component: Component) => component.node));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getComponents();
  }, []);

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
  };

  const editList = async (node: Node | null, title: string) => {
    try {
      const response = await axios.put(`/api/alfresco/folder/${categoryName}/${node?.categoryComponentId}`, {
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

  const deleteComponent = async (node: Node) => {
    try {
      const response = await axios.delete(`/api/alfresco/folder/${categoryName}/${node?.alfrescoNodeId}`);
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

  const openEditModal = (node: Node) => {
    setIsNewList(false);
    setSelectedComponent(node);
    setTitle(node.title);
    setOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', width: '100%', marginLeft: theme.spacing(5) }}>
      {nodes.map((node: Node) => (
        <FolderList
          title={node.title}
          isEditing={isEditing}
          parentNode={node}
          onEdit={(node) => openEditModal(node)}
        ></FolderList>
      ))}
      <Button onClick={() => openDialog()}>{t('common:list.add_list')}</Button>
      <Modal
        open={open}
        onSnackbarClose={handleSnackbarClose}
        handleClose={handleClose}
        title={isNewList ? t('common:list.add_list') : t('common:list.edit_list')}
        success={success}
        error={error}
        errorMessage={t('common:edit.saved_failure')}
        successMessage={t('common:edit.saved_success')}
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
      ></Modal>
    </Box>
  );
};
