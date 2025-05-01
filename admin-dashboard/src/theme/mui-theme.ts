// src/theme/mui-theme.ts
// This file is maintained for backward compatibility
// For new code, use the ThemeContextProvider from @/contexts/theme-context

import { createTheme, responsiveFontSizes } from "@mui/material";
import { getPalette } from "./palette";

export let muiTheme = createTheme({
  palette: getPalette("light"),
  typography: {
    fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
  },
});

// Enable responsive font sizes
muiTheme = responsiveFontSizes(muiTheme);
