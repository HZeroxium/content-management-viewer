// /src/contexts/theme-context.tsx

"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import {
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { PaletteMode } from "@mui/material";
import { getPalette } from "@/theme/palette";

type ThemeContextType = {
  currentTheme: PaletteMode;
  toggleTheme: () => void;
};

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  currentTheme: "light",
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize theme from localStorage if available, otherwise use 'light'
  const [currentTheme, setCurrentTheme] = useState<PaletteMode>("light");

  // Load saved theme preference from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      setCurrentTheme(savedTheme);
    } else {
      // Use system preference as fallback
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setCurrentTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme]);

  // Create the theme object based on current mode selection
  const theme = React.useMemo(() => {
    const baseTheme = createTheme({
      palette: getPalette(currentTheme),
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
    });

    return responsiveFontSizes(baseTheme);
  }, [currentTheme]);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setCurrentTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
