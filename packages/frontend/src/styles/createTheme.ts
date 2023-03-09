import { createTheme } from '@mui/material';

import { DefaultFonts } from '../constants/Fonts';

import '../assets/fonts/Exo_2/Exo2-Regular.ttf';
import '../assets/fonts/Exo_2/Exo2-ExtraBold.ttf';
import '../assets/fonts/Exo_2/Exo2-Bold.ttf';
import '../assets/fonts/Exo_2/Exo2-LightItalic.ttf';
import { Colors } from '../constants/Colors';
import { Viewports } from '../constants/Viewports';

// Default theme object: https://mui.com/material-ui/customization/default-theme/#main-content
export const theme = createTheme({
  spacing: 8, // default 8px
  breakpoints: {
    values: {
      mobile: Viewports.MOBILE,
      tablet: Viewports.TABLET,
      desktop: Viewports.DESKTOP,
    },
  },
  palette: {
    primary: {
      main: Colors.darkblue,
    },
    secondary: {
      main: Colors.extrablack,
    },
    transparent: {
      main: Colors.white,
    },
  },
  // Typography reference: https://www.figma.com/file/RowcUf6WZvVTqkChr6IRG6/Extranet?node-id=1%3A379
  typography: {
    fontFamily: ['Exo2-Regular', ...DefaultFonts].join(','),
    fontSize: 16,
    subtitle1: {
      fontFamily: ['Exo2-Bold', ...DefaultFonts].join(','),
      fontSize: 23,
    },
    subtitle2: {
      fontFamily: ['Exo2-Bold', ...DefaultFonts].join(','),
      fontSize: 16,
    },
    body1: {
      fontFamily: ['Exo2-Regular', ...DefaultFonts].join(','),
      fontSize: 16,
    },
    body2: {
      fontFamily: ['Exo2-Regular', ...DefaultFonts].join(','),
      fontSize: 18,
    },
    button: {
      fontFamily: ['Exo2-Regular', ...DefaultFonts].join(','),
      fontSize: 20,
      color: 'white',
      textTransform: 'uppercase',
      textAlign: 'center',
    },
  },
});
