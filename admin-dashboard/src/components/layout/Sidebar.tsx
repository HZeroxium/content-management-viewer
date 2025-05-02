// src/components/layout/Sidebar.tsx
"use client";

import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Tooltip,
  alpha,
} from "@mui/material";
import {
  People as PeopleIcon,
  Article as ArticleIcon,
  Category as CategoryIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { usePathname, useRouter } from "next/navigation";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const drawerWidth = 240;
const closedDrawerWidth = 65; // Width when collapsed

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { text: "Users", icon: <PeopleIcon />, path: "/dashboard/users" },
    { text: "Content", icon: <ArticleIcon />, path: "/dashboard/content" },
    { text: "Files", icon: <CategoryIcon />, path: "/dashboard/files" },
  ];

  const handleItemClick = (path: string) => {
    router.push(path);
    if (isMobile) {
      onClose();
    }
  };

  const isItemActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const drawerContent = (
    <Box
      sx={{
        width: open ? drawerWidth : closedDrawerWidth,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        overflowX: "hidden",
      }}
    >
      {/* Logo area */}
      <Box
        sx={{
          p: 2,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "space-between" : "center",
        }}
      >
        {open && (
          <Box
            component="img"
            src="/logo.png"
            alt="Logo"
            sx={{ height: 40, display: { xs: "none", sm: "block" } }}
          />
        )}
        {!isMobile && (
          <Tooltip title={open ? "Collapse menu" : "Expand menu"}>
            <ListItemButton
              onClick={onClose}
              sx={{
                borderRadius: "50%",
                minWidth: 35,
                minHeight: 35,
                p: 0.5,
                justifyContent: "center",
                ml: open ? "auto" : 0,
              }}
            >
              {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </ListItemButton>
          </Tooltip>
        )}
      </Box>

      <Divider />

      {/* Menu items */}
      <List>
        {menuItems.map((item) => {
          const isActive = isItemActive(item.path);

          return (
            <ListItem key={item.text} disablePadding>
              <Tooltip title={!open ? item.text : ""} placement="right">
                <ListItemButton
                  selected={isActive}
                  onClick={() => handleItemClick(item.path)}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                    py: 1.5,
                    mb: 0.5,
                    mx: 1,
                    borderRadius: 1,
                    position: "relative",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                    "&.Mui-selected": {
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        left: -8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        height: "60%",
                        width: 4,
                        backgroundColor: theme.palette.primary.main,
                        borderRadius: "0 4px 4px 0",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                      color: isActive ? "primary.main" : "inherit",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isActive ? "medium" : "regular",
                        fontSize: "0.95rem",
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {/* Footer area that could contain additional info */}
      {open && (
        <>
          <Divider sx={{ mb: 1 }} />
          <Box
            sx={{
              p: 2,
              fontSize: "0.8rem",
              color: "text.secondary",
              textAlign: "center",
            }}
          >
            Admin Dashboard v1.0
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { md: open ? drawerWidth : closedDrawerWidth },
        flexShrink: { md: 0 },
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      {isMobile ? (
        // Mobile drawer - temporary, closes when clicking away
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              boxShadow: theme.shadows[8],
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        // Desktop drawer - persistent but can be collapsed
        <Drawer
          variant="permanent"
          sx={{
            width: open ? drawerWidth : closedDrawerWidth,
            "& .MuiDrawer-paper": {
              width: open ? drawerWidth : closedDrawerWidth,
              boxSizing: "border-box",
              overflowX: "hidden",
              borderRight: `1px solid ${theme.palette.divider}`,
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
          open={open}
        >
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;
