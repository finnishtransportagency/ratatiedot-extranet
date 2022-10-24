import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import { Typography } from '@mui/material';
import { Routes } from '../../constants/Routes';

export interface IMenuItem {
  key: string;
  primary: string | JSX.Element;
  icon: JSX.Element;
  to: string;
}

export const MenuItemList: IMenuItem[] = [
  {
    key: 'Landing',
    primary: 'Etusivu',
    icon: <InfoIcon />,
    to: Routes.LANDING,
  },
  // Logout should always be the last menu item
  {
    key: 'Logout',
    primary: <Typography variant="subtitle2">Kirjaudu ulos</Typography>,
    icon: <LogoutIcon />,
    to: Routes.HOME, // To-do: unauthenticated route
  },
];
