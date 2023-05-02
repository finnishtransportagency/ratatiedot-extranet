import { Box } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getCategoryRouteName } from "../../routes";
import { FolderList } from "./FolderList";

const nodes = [
  {
    id: "asdasd-123123",
    name: "important folder"
  }
]

export const Folders = () => {
  const [components, setComponents] = useState([]);
  const location = useLocation();
  const categoryName = getCategoryRouteName(location);

  const getComponents = () => {
    try {
      axios.get(`api/alfresco/folders/${categoryName}`);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getComponents();
  }, []);

  <Box>{
    components.map(node =>
      <FolderList node={node}></FolderList>
    )
  }</Box >
};
