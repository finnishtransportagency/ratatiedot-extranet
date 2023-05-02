import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import { Typography } from '@mui/material';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import DirectionsIcon from '@mui/icons-material/Directions';
import SubwayIcon from '@mui/icons-material/Subway';
import ShieldIcon from '@mui/icons-material/Shield';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import WidgetsIcon from '@mui/icons-material/Widgets';
import BrowserNotSupportedIcon from '@mui/icons-material/BrowserNotSupported';
import StarBorderIcon from '@mui/icons-material/StarBorder';

import { matchRouteWithCategory, Routes } from '../../constants/Routes';
import categoryData from '../../assets/data/FinnishCategories.json';
import { getRouterName, getTranslatedCategoryData } from '../../utils/helpers';
import axios from 'axios';

export interface IMenuItem {
  key: string;
  primary: string | JSX.Element;
  icon?: JSX.Element;
  to?: string;
  children?: IMenuItem[];
}

const fetchMaterialClass = (): IMenuItem[] => {
  const loadIcons = (category: string) => {
    switch (category) {
      case 'Kaaviot':
        return <SsidChartIcon />;
      case 'Liikennöinti':
        return <DirectionsIcon />;
      case 'Taitorakenteet':
        return <SubwayIcon />;
      case 'Turvalaitteet':
        return <ShieldIcon />;
      case 'Yhteystiedot':
        return <AlternateEmailIcon />;
      case 'Muut':
        return <WidgetsIcon />;
      default:
        return <BrowserNotSupportedIcon />;
    }
  };
  return getTranslatedCategoryData(categoryData).map((data) => {
    return {
      key: data.category,
      primary: data.category,
      icon: loadIcons(data.category),
      children: data.subCategories.map((item) => {
        return {
          key: item,
          primary: item,
          // TODO: Route names may be changed
          to: `/${getRouterName(data.category)}/${getRouterName(item)}`,
        };
      }),
    };
  });
};

const fetchFavoriteCategories = async (): Promise<IMenuItem> => {
  const response = await axios.get('http://localhost:3002/api/database/favorites');
  const categories = await response.data;

  return categories
    ? categories.map((category: any) => {
        const { rataextraRequestPage } = category.categoryDataBase;
        return {
          key: category.id,
          primary: rataextraRequestPage,
          icon: '',
          to: matchRouteWithCategory(rataextraRequestPage),
        };
      })
    : [];

  // return {
  //   key: 'Favorite',
  //   primary: 'Suosikki',
  //   icon: <StarBorderIcon />,
  //   children: await favorites,
  // };
};

fetchFavoriteCategories().then((t) => console.log(t));

export const MenuItems: any = [
  {
    key: 'Landing',
    primary: 'Etusivu',
    icon: <InfoIcon />,
    to: Routes.HOME,
  },
  // ...(fetchFavoriteCategories() as any),
  {
    key: 'Favorite',
    primary: 'Suosikki',
    icon: <StarBorderIcon />,
    // children: fetchFavoriteCategories().then((t) => t),
  },
  ...fetchMaterialClass(),
  // Logout should always be the last menu item
  {
    key: 'Logout',
    primary: <Typography variant="subtitle2">Kirjaudu ulos</Typography>,
    icon: <LogoutIcon />,
    to: `${window.location.origin}/sso/logout?auth=1`,
  },
];
