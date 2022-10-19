import { Theme as MaterialTheme } from '@mui/material';

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: false; // removes the `xs` breakpoint
    sm: false;
    md: false;
    lg: false;
    xl: false;
    mobile: true; // adds the `mobile` breakpoint
    tablet: true;
    desktop: true;
  }

  interface Palette {
    transparent: Palette['primary'];
  }

  interface PaletteOptions {
    transparent: PaletteOptions['primary'];
  }
}

declare module '@emotion/react' {
  export interface Theme extends MaterialTheme {}
}
