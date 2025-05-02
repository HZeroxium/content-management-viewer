// /src/components/layout/Header.tsx

"use client";

import React from "react";
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useAppAuth } from "@/lib/hooks/useAppAuth";
import { ConnectionStatus } from "./ConnectionStatus";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useSocket } from "@/lib/hooks/useSocket";
import { useTheme } from "@/contexts/theme-context";

interface HeaderProps {
  onMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAppAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const socketConnected = useSelector((s: RootState) => s.ui.socketConnected);
  const { currentTheme, toggleTheme } = useTheme();

  // Initialize the WebSocket connection
  useSocket();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleMenuClose();
  };

  // Get user initials for avatar
  const getInitials = (): string => {
    if (!user) return "";
    if (user.name) return user.name.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <AppBar
      position="sticky"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        {onMenuToggle && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={onMenuToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Content Management System
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* Socket connection status */}
          <Tooltip
            title={socketConnected ? "Connected to server" : "Disconnected"}
          >
            <Box sx={{ mx: 1 }}>
              <ConnectionStatus />
            </Box>
          </Tooltip>

          {/* Dark mode toggle */}
          <Tooltip
            title={`Switch to ${
              currentTheme === "light" ? "dark" : "light"
            } mode`}
          >
            <IconButton color="inherit" onClick={toggleTheme} sx={{ mx: 1 }}>
              {currentTheme === "light" ? (
                <Brightness4Icon />
              ) : (
                <Brightness7Icon />
              )}
            </IconButton>
          </Tooltip>

          {/* User profile */}
          <Box sx={{ ml: 1 }}>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                sx={{ padding: 0 }}
              >
                {user ? (
                  <Avatar
                    sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}
                  >
                    {getInitials()}
                  </Avatar>
                ) : (
                  <AccountCircleIcon fontSize="large" />
                )}
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
            >
              <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
              <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
