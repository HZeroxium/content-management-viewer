"use client";

import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4"; // Dark mode
import Brightness7Icon from "@mui/icons-material/Brightness7"; // Light mode
import { useTheme } from "@/contexts/theme-context";

export default function ThemeToggle() {
  const { currentTheme, toggleTheme } = useTheme();

  return (
    <Tooltip
      title={`Switch to ${currentTheme === "light" ? "dark" : "light"} mode`}
    >
      <IconButton onClick={toggleTheme} color="inherit">
        {currentTheme === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
      </IconButton>
    </Tooltip>
  );
}
