// src/theme/palette.ts
import { PaletteMode, PaletteOptions } from "@mui/material";

const lightPalette: PaletteOptions = {
  mode: "light" as PaletteMode,
  primary: {
    main: "#1976d2",
    light: "#42a5f5",
    dark: "#1565c0",
  },
  secondary: {
    main: "#9c27b0",
    light: "#ba68c8",
    dark: "#7b1fa2",
  },
  error: {
    main: "#d32f2f",
    light: "#ef5350",
    dark: "#c62828",
  },
  warning: {
    main: "#ed6c02",
    light: "#ff9800",
    dark: "#e65100",
  },
  info: {
    main: "#0288d1",
    light: "#03a9f4",
    dark: "#01579b",
  },
  success: {
    main: "#2e7d32",
    light: "#4caf50",
    dark: "#1b5e20",
  },
  background: {
    default: "#f5f5f5",
    paper: "#ffffff",
  },
  text: {
    primary: "#212121",
    secondary: "#757575",
  },
};

const darkPalette: PaletteOptions = {
  mode: "dark" as PaletteMode,
  primary: {
    main: "#90caf9",
    light: "#bbdefb",
    dark: "#42a5f5",
  },
  secondary: {
    main: "#ce93d8",
    light: "#e1bee7",
    dark: "#ab47bc",
  },
  error: {
    main: "#f44336",
    light: "#e57373",
    dark: "#d32f2f",
  },
  warning: {
    main: "#ffa726",
    light: "#ffb74d",
    dark: "#f57c00",
  },
  info: {
    main: "#29b6f6",
    light: "#4fc3f7",
    dark: "#0288d1",
  },
  success: {
    main: "#66bb6a",
    light: "#81c784",
    dark: "#388e3c",
  },
  background: {
    default: "#121212",
    paper: "#1e1e1e",
  },
  text: {
    primary: "#ffffff",
    secondary: "#b0b0b0",
  },
};

export const getPalette = (mode: PaletteMode): PaletteOptions =>
  mode === "dark" ? darkPalette : lightPalette;
