import { Box } from "@mui/material";
import axios from "axios";

interface Folder {
  id: string;
  name: string;
}

interface FolderListProps {
  folders: Folder[]
}

export const FolderList = ({ node }: FolderListProps) => {
  const getFolders = () => {
    try {
      axios.get(`api/alfresco/files?category=${}`);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getComponents();
  }, []);

  return (
    <Box>
      {
        folders.map(folder => <div>{folder.id}</div>)
      }
    </Box>
  );
};

