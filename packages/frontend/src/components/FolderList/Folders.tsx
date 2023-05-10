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
import { Node } from './FolderList';

interface FoldersProps {
  isEditing: boolean;
}

export const Folders = ({ isEditing }: FoldersProps) => {
  const [components, setComponents] = useState([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isNewList, setIsNewList] = useState(false);
  const categoryName = getCategoryRouteName(useLocation());

  const getComponents = async () => {
    try {
      const response: any = await axios.get(`api/database/components/${categoryName}`);
      setComponents(response.data.map((component: any) => component.node));
      console.log('components', response.data);
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
      return response;
    } catch (error) {
      console.log('error: ', error);
    }
  };

  const editList = async (node: Node | null, title: string) => {
    try {
      const response = await axios.put(`/api/alfresco/folder/${categoryName}/${node?.id}`, {
        name: title,
        properties: {
          'cm:title': title,
          'cm:description': '',
        },
      });
      return response;
    } catch (error) {
      console.log('error: ', error);
    }
  };

  const openDialog = () => {
    setTitle('');
    setIsNewList(true);
    setOpen(true);
  };

  const handleSnackbarClose = () => {};

  const handleClose = () => {
    setOpen(false);
  };

  const openEditModal = (node: Node) => {
    console.log(node);
    setIsNewList(false);
    setSelectedNode(node);
    setTitle(node.title);
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
      <Button onClick={() => openDialog()}>Lisää lista</Button>
      <ListModal
        open={open}
        onSnackbarClose={handleSnackbarClose}
        handleClose={handleClose}
        title={t('common:list.add_list')}
        children={
          <Box component="form">
            <Typography variant="body1">Otsikko</Typography>
            <TextField fullWidth onChange={(e) => setTitle(e.target.value)} defaultValue={title}></TextField>
            <Box sx={{ display: 'flex' }}>
              <ButtonWrapper sx={{ marginLeft: 'auto' }} color="primary" variant="text" onClick={() => handleClose()}>
                {t('common:action.cancel')}
              </ButtonWrapper>
              {isNewList ? (
                <ButtonWrapper color="primary" variant="contained" onClick={() => addList(title)}>
                  {t('common:action.add')}
                </ButtonWrapper>
              ) : (
                <ButtonWrapper color="primary" variant="contained" onClick={() => editList(selectedNode, title)}>
                  muokkaa
                </ButtonWrapper>
              )}
            </Box>
          </Box>
        }
      ></ListModal>
    </Box>
  );
};
