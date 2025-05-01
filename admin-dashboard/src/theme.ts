// This file is maintained for backward compatibility
// New code should import from @/theme/index or @/contexts/theme-context directly

import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import { getPalette } from "./theme/palette";

// Create a default theme instance (light mode)
const theme = responsiveFontSizes(
  createTheme({
    palette: getPalette("light"),
    typography: {
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      h1: { fontSize: "2.5rem", fontWeight: 500 },
      h2: { fontSize: "2rem", fontWeight: 500 },
      h3: { fontSize: "1.75rem", fontWeight: 500 },
      h4: { fontSize: "1.5rem", fontWeight: 500 },
      h5: { fontSize: "1.25rem", fontWeight: 500 },
      h6: { fontSize: "1rem", fontWeight: 500 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 4,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  })
);

export default theme;
