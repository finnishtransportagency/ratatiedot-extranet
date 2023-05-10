import Edit from '@mui/icons-material/Edit';
import { Box, IconButton, Link, Typography } from '@mui/material';
import axios from 'axios';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { Colors } from '../../constants/Colors';
import { Styles } from '../../constants/Styles';
import { theme } from '../../styles/createTheme';

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
  const [folders, setFolders] = useState<any[]>([]);
  const getFolders = async () => {
    try {
      const response: any = await axios.get(`api/alfresco/nodes/${parentNode.alfrescoNodeId}?type=folder`);
      console.log('nodes', JSON.stringify(response.data, null, 2));
      setFolders(response.data.list.entries);
    } catch (error) {
      console.log(error);
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
      {folders.map((folder: any) => (
        <Box
          sx={{
            padding: theme.spacing(2),
            backgroundColor: Colors.lightgrey,
            marginBottom: theme.spacing(1),
            borderRadius: Styles.radius,
            borderLeft: `8px solid ${Colors.lightgreen}`,
          }}
        >
          <Link href={`/files?id=${folder.entry.id}`}>{folder.entry.name}</Link>
        </Box>
      ))}
    </Box>
  );
};
