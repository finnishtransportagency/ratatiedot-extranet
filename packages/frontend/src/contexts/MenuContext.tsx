import React, { useEffect, useState } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import { Typography } from '@mui/material';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import DirectionsIcon from '@mui/icons-material/Directions';
import SubwayIcon from '@mui/icons-material/Subway';
import ShieldIcon from '@mui/icons-material/Shield';
import Bolt from '@mui/icons-material/Bolt';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import WidgetsIcon from '@mui/icons-material/Widgets';
import BrowserNotSupportedIcon from '@mui/icons-material/BrowserNotSupported';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import { toast } from 'react-toastify';

import { Routes } from '../constants/Routes';
import categoryData from '../assets/data/FinnishCategories.json';
import { getRouterName, getTranslatedCategoryData, matchRouteWithCategory, parseRouterName } from '../utils/helpers';
import axios from 'axios';
import { get } from 'lodash';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../utils/errorUtil';
import HelpIcon from '@mui/icons-material/Help';

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
      case 'Sähkörata':
        return <Bolt />;
      case 'Yhteystiedot':
        return <AlternateEmailIcon />;
      case 'Muut':
        return <WidgetsIcon />;
      case 'Käyttöohjeet':
        return <HelpIcon />;
      case 'Baliisisanomat':
        return <HelpIcon />;
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
          to: `/${getRouterName(data.category)}/${getRouterName(item)}`,
        };
      }),
    };
  });
};

const fetchFavoriteCategories = async (): Promise<IMenuItem[]> => {
  try {
    const response = await axios.get('/api/database/favorites');
    const categories = await response.data;

    return categories
      ? categories.map((category: any) => {
          const rataextraRequestPage = get(category, 'categoryDataBase.rataextraRequestPage', '');
          return {
            key: category.id,
            primary: parseRouterName(rataextraRequestPage),
            icon: '',
            to: matchRouteWithCategory(Routes, rataextraRequestPage),
          };
        })
      : [];
  } catch (e) {
    throw e;
  }
};

const postFavoriteCategory = async (categoryRoute: string) => {
  try {
    const response = await axios.post(
      `/api/database/favorites`,
      { category: categoryRoute },
      { headers: { 'Content-Type': 'application/json' } },
    );
    const newCategory = await response.data;
    return newCategory;
  } catch (e: any) {
    toast(getErrorMessage(e), { type: 'error' });
    throw e;
  }
};

const deleteFavoriteCategory = async (categoryRoute: string) => {
  try {
    const response = await axios.delete(`/api/database/favorites?category=${categoryRoute}`);
    const newCategory = await response.data;
    return newCategory;
  } catch (e: any) {
    toast(getErrorMessage(e), { type: 'error' });
    throw e;
  }
};

export const MenuContext = React.createContext({
  menu: {},
  menuItems: [],
  favoriteCategories: [],
  resetMenu: () => {},
  menuHandler: (_: string) => {},
  addFavoriteHandler: (_: string) => {},
  removeFavoriteHandler: (_: string) => {},
  fileUploadDisabled: true,
  fileUploadDisabledHandler: (_: boolean) => {},
});

export const MenuContextProvider = (props: any) => {
  const { t } = useTranslation(['common']);
  const [favoriteCategories, setFavoriteCategories] = useState<IMenuItem[]>([]);
  const [fileUploadDisabled, setFileUploadDisabled] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      const favorites = await fetchFavoriteCategories();
      setFavoriteCategories(favorites);
    };

    fetchFavorites();
  }, []);

  const menuItems: any = [
    {
      key: t('common:menu.frontpage'),
      primary: t('common:menu.frontpage'),
      icon: <InfoIcon />,
      to: Routes.HOME,
    },
    {
      key: t('common:menu.favorite'),
      primary: t('common:menu.favorite'),
      icon: <StarBorderIcon />,
      children: favoriteCategories,
    },
    ...fetchMaterialClass(),
    // Logout should always be the last menu item
    {
      key: t('common:menu.balise'),
      primary: t('common:menu.balise'),
      icon: <RadioButtonCheckedIcon />,
      to: Routes.BALISE,
    },
    {
      key: t('common:menu.logout'),
      primary: <Typography variant="subtitle2">{t('common:menu.logout')}</Typography>,
      icon: <LogoutIcon />,
      to: `${window.location.origin}/sso/logout?auth=1`,
    },
  ];

  const initMenu = () => {
    let menuData = {};
    menuItems.forEach((item: IMenuItem) => {
      menuData = {
        ...menuData,
        [item.key]: false,
      };
    });
    return menuData;
  };

  const [menu, setMenu] = useState<{ [key: string]: boolean }>(initMenu);

  const menuHandler = (key: string) => {
    setMenu({ ...menu, [key]: !menu[key] });
  };

  const resetMenu = () => {
    setMenu(initMenu);
  };

  const addFavoriteHandler = async (categoryRoute: string) => {
    try {
      await postFavoriteCategory(categoryRoute);
      // Refetch favorite categories after adding a new one
      const updatedFavorites = await fetchFavoriteCategories();
      setFavoriteCategories(updatedFavorites);
    } catch (e) {
      console.error('Error adding favorite:', e);
    }
  };

  const removeFavoriteHandler = async (categoryRoute: string) => {
    try {
      await deleteFavoriteCategory(categoryRoute);
      // Refetch favorite categories after removing one
      const updatedFavorites = await fetchFavoriteCategories();
      setFavoriteCategories(updatedFavorites);
    } catch (e) {
      console.error('Error removing favorite:', e);
    }
  };

  const fileUploadDisabledHandler = (isDisabled: boolean) => {
    setFileUploadDisabled(isDisabled);
  };

  return (
    <MenuContext.Provider
      value={{
        menu: menu,
        menuItems: menuItems,
        favoriteCategories: favoriteCategories as any,
        resetMenu: resetMenu,
        menuHandler: menuHandler,
        addFavoriteHandler: addFavoriteHandler,
        removeFavoriteHandler: removeFavoriteHandler,
        fileUploadDisabled: fileUploadDisabled,
        fileUploadDisabledHandler: fileUploadDisabledHandler,
      }}
    >
      {props.children}
    </MenuContext.Provider>
  );
};
