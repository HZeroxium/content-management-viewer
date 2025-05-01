// src/theme/mui-theme.ts
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
