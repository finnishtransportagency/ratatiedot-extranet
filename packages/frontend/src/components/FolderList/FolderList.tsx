import { Box } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface Folder {
  id: string;
  name: string;
}

interface FolderListProps {
  parentNodeId: string;
}

export const FolderList = ({ parentNodeId }: FolderListProps) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const getFolders = async () => {
    try {
      const response: Folder[] = await axios.get(`api/alfresco/files/${parentNodeId}?type=folder`);
      console.log('nodes', response);
      setFolders(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getFolders();
  }, []);

  return (
    <Box>
      {folders.map((folder: Folder) => (
        <div>{folder.id}</div>
      ))}
    </Box>
  );
};
