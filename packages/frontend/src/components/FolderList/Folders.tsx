import { Box } from '@mui/material';
import axios from 'axios';
import { FunctionComponent, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getCategoryRouteName } from '../../routes';
import { FolderList } from './FolderList';

export const Folders: FunctionComponent = () => {
  const [components, setComponents] = useState([]);
  const location = useLocation();
  const categoryName = getCategoryRouteName(location);

  const getComponents = async () => {
    try {
      const response: any = await axios.get(`api/database/components/${categoryName}`);
      console.log('components', response);
      setComponents(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getComponents();
  }, []);

  return (
    <div>
      {components.map((component: any) => {
        return <FolderList parentNodeId={component.alfrescoNodeId} />;
      })}
    </div>
  );
};
