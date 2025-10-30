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
      light: Colors.lightblue,
      dark: Colors.darkblue,
    },
    secondary: {
      main: Colors.extrablack,
      light: Colors.darkgrey,
    },
    error: {
      main: Colors.darkred,
      light: Colors.lightred,
    },
    warning: {
      main: Colors.yellow,
    },
    success: {
      main: Colors.darkgreen,
      light: Colors.lightgreen,
    },
    info: {
      main: Colors.midblue,
      light: Colors.aliceblue,
    },
    grey: {
      50: Colors.lightgrey,
      100: Colors.lightgrey,
      200: Colors.midgrey,
      300: Colors.midgrey,
      500: Colors.darkgrey,
      600: Colors.darkgrey,
    },
    background: {
      default: Colors.white,
      paper: Colors.white,
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
    h4: {
      fontFamily: ['Exo2-Bold', ...DefaultFonts].join(','),
      fontSize: 16,
      lineHeight: '24px',
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
