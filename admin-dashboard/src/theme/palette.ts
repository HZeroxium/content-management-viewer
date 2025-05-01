// src/theme/palette.ts
import { PaletteMode, PaletteOptions } from "@mui/material";

const lightPalette: PaletteOptions = {
  mode: "light" as PaletteMode,
  primary: { main: "#1976d2" },
  secondary: { main: "#9c27b0" },
  background: { default: "#fafafa", paper: "#fff" },
};

const darkPalette: PaletteOptions = {
  mode: "dark" as PaletteMode,
  primary: { main: "#90caf9" },
  secondary: { main: "#ce93d8" },
  background: { default: "#121212", paper: "#1e1e1e" },
};

export const getPalette = (mode: PaletteMode) =>
  mode === "dark" ? darkPalette : lightPalette;
