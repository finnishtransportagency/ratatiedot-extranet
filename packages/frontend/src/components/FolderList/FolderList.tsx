import Edit from '@mui/icons-material/Edit';
import { Box, IconButton, Link, Typography } from '@mui/material';
import axios, { AxiosResponse } from 'axios';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { Colors } from '../../constants/Colors';
import { Styles } from '../../constants/Styles';
import { theme } from '../../styles/createTheme';
import { AlfrescoPaginatedResponse, AlfrescoResponse } from '../../types/types';

export interface Node {
  id: string;
  title: string;
  type: string;
  alfrescoNodeId: string;
  CategoryComponent: string;
  categoryComponentId: string;
}

interface FolderListProps {
  parentNode: Node;
  isEditing: boolean;
  title: string;
  onEdit: (node: Node) => void;
}

export const FolderList = ({ parentNode, isEditing, title, onEdit }: FolderListProps) => {
  const [folders, setFolders] = useState<AlfrescoResponse[]>([]);
  const getFolders = async () => {
    try {
      const response: AxiosResponse<AlfrescoPaginatedResponse> = await axios.get(
        `api/alfresco/nodes/${parentNode.alfrescoNodeId}?type=folder`,
      );
      setFolders(response.data.list.entries);
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  useEffect(() => {
    getFolders();
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: '240px',
        marginRight: theme.spacing(5),
        marginBottom: theme.spacing(5),
      }}
    >
      <Box sx={{ display: 'flex' }}>
        <Typography variant="body2" sx={{ textTransform: 'uppercase', marginBottom: theme.spacing(1) }}>
          {title}
        </Typography>
        <IconButton
          sx={{ color: Colors.extrablack, marginRight: '-10px', marginLeft: 'auto' }}
          aria-label={t('common:edit.edit')}
          onClick={() => onEdit(parentNode)}
        >
          <Edit />
        </IconButton>
      </Box>
      {folders.map((folder) => (
        <Box
          sx={{
            padding: theme.spacing(2),
            backgroundColor: Colors.lightgrey,
            marginBottom: theme.spacing(1),
            borderRadius: Styles.radius,
            borderLeft: `8px solid ${Colors.lightgreen}`,
          }}
        >
          <Link sx={{ textDecoration: 'none' }} href={`/files?id=${folder.entry.id}`}>
            {folder.entry.name}
          </Link>
        </Box>
      ))}
    </Box>
  );
};
