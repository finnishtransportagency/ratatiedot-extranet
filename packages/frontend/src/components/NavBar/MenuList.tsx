import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { IMenuItem, MenuItems } from './MenuItems';

type MenuListProps = {
  open: boolean;
};

export const MenuList = ({ open }: MenuListProps) => {
  const navigate = useNavigate();
  return (
    <List>
      {MenuItems.map((item: IMenuItem) => {
        const { key, primary, icon, to } = item;
        return (
          <ListItem key={key} disablePadding onClick={() => navigate(to)}>
            <ListItemButton>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={primary} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};
