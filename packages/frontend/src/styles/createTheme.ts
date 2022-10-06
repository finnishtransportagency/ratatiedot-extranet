import { createTheme } from '@mui/material';

import { DefaultFonts } from '../constants/Fonts';

import '../assets/fonts/Exo_2/Exo2-Regular.ttf';
import '../assets/fonts/Exo_2/Exo2-ExtraBold.ttf';
import '../assets/fonts/Exo_2/Exo2-Bold.ttf';
import '../assets/fonts/Exo_2/Exo2-LightItalic.ttf';
import { Colors } from '../constants/Colors';

// Default theme object: https://mui.com/material-ui/customization/default-theme/#main-content
export const theme = createTheme({
  spacing: 8, // default 8px
  breakpoints: {
    values: {
      mobile: 0,
      tablet: 640,
      desktop: 1024,
    },
  },
  palette: {
    primary: {
      main: Colors.darkblue,
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
    button: {
      fontFamily: ['Exo2-Regular', ...DefaultFonts].join(','),
      fontSize: 20,
      color: 'white',
      textTransform: 'uppercase',
      textAlign: 'center',
    },
  },
});
