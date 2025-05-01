// src/components/layout/TopBar.tsx
"use client";

import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  Avatar,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import WifiIcon from "@mui/icons-material/Wifi";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import { useAppAuth } from "@/lib/hooks/useAppAuth";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useSocket } from "@/lib/hooks/useSocket";

export default function TopBar() {
  const { logout, user } = useAppAuth();
  const socketConnected = useSelector((s: RootState) => s.ui.socketConnected);
  useSocket(); // manage connection status in ui slice

  // Get the first character safely for the avatar
  const getInitials = () => {
    if (!user) return "";

    // Check if email exists and use it as fallback
    if (user.email) {
      return user.email[0].toUpperCase();
    }

    return "U"; // Default if no identifiable info
  };

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          CMS Admin
        </Typography>
        <Box sx={{ mr: 2 }}>
          <Badge
            color={socketConnected ? "success" : "error"}
            variant="dot"
            overlap="circular"
          >
            {socketConnected ? <WifiIcon /> : <WifiOffIcon />}
          </Badge>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar sx={{ mr: 1, bgcolor: "secondary.main" }}>
            {getInitials()}
          </Avatar>
          <IconButton color="inherit" onClick={() => logout()}>
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
