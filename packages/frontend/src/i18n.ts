// Frontend app is configured to support translations.
// Translation files for other languages can be found in public directory.
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import common from './assets/locales/fi/common.json';
import landing from './assets/locales/fi/landing.json';
import search from './assets/locales/fi/search.json';
import accessDenied from './assets/locales/fi/accessDenied.json';
import notFound from './assets/locales/fi/notFound.json';

export const defaultNS = 'common';
export const resources = {
  fi: {
    common,
    landing,
    search,
    accessDenied,
    notFound,
  },
};

i18next.use(initReactI18next).init({
  lng: 'fi', // override any language detector and use Finnish as default. Remove this if you need localization in the future.
  fallbackLng: 'fi',
  debug: false, // turn off for running unit tests
  resources,
  defaultNS,
});
