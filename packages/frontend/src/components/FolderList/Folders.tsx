import { Box } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getCategoryRouteName } from '../../routes';
import { theme } from '../../styles/createTheme';
import { FolderList } from './FolderList';

interface FoldersProps {
  isEditing: boolean;
}

export const Folders = ({ isEditing }: FoldersProps) => {
  const [components, setComponents] = useState([]);
  const location = useLocation();
  const categoryName = getCategoryRouteName(location);

  const getComponents = async () => {
    try {
      const response: any = await axios.get(`api/database/components/${categoryName}`);
      setComponents(response.data.map((component: any) => component.node));
      console.log('components', components);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getComponents();
  }, []);

  return (
    <Box sx={{ display: 'flex', width: '100%', marginLeft: theme.spacing(5) }}>
      {components.map((component: any) => (
        <FolderList title={component.title} isEditing={isEditing} parentNodeId={component.alfrescoNodeId}></FolderList>
      ))}
    </Box>
  );
};
