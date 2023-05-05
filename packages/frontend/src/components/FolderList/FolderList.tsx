import { Box, Button, Link, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Colors } from '../../constants/Colors';
import { Styles } from '../../constants/Styles';
import { theme } from '../../styles/createTheme';

interface FolderListProps {
  parentNodeId: string;
  isEditing: boolean;
  title: string;
}

export const FolderList = ({ parentNodeId, isEditing, title }: FolderListProps) => {
  const [folders, setFolders] = useState<any[]>([]);
  const getFolders = async () => {
    try {
      const response: any = await axios.get(`api/alfresco/nodes/${parentNodeId}?type=folder`);
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
      }}
    >
      <Typography variant="body2" sx={{ textTransform: 'uppercase', marginBottom: theme.spacing(1) }}>
        {title}
      </Typography>
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
      <Button>Lisää kansio</Button>
    </Box>
  );
};
