// Frontend app is configured to support translations.
// Translation files for other languages can be found in public directory.
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import common from './assets/locales/fi/common.json';
import landing from './assets/locales/fi/landing.json';

export const defaultNS = 'common';
export const resources = {
  fi: {
    common,
    landing,
  },
};

i18next.use(LanguageDetector).use(initReactI18next).init({
  lng: 'fi', // override any language detector and use Finnish as default. Remove this if you need localization in the future.
  fallbackLng: 'fi',
  debug: true,
  resources,
  defaultNS,
});
