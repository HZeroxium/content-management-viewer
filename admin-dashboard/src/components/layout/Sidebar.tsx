// src/components/layout/Sidebar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/utils/constants";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  Theme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { m } from "framer-motion";

const drawerWidth = 240;

export default function Sidebar() {
  const pathname = usePathname();
  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const content = (
    <Box sx={{ width: drawerWidth }}>
      <List>
        {NAV_ITEMS.map((item) => (
          <Link key={item.path} href={item.path} passHref>
            <ListItemButton
              component="a"
              selected={pathname === item.path}
              sx={{ mb: 1 }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </Link>
        ))}
      </List>
    </Box>
  );

  if (isDesktop) {
    return (
      <Drawer
        variant="permanent"
        open
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <>
      <IconButton
        aria-label="open drawer"
        onClick={() => setMobileOpen(true)}
        sx={{ position: "fixed", top: 16, left: 16, zIndex: 1300 }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        <m.div
          initial={{ x: -drawerWidth }}
          animate={{ x: 0 }}
          exit={{ x: -drawerWidth }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {content}
        </m.div>
      </Drawer>
    </>
  );
}
