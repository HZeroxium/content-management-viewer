// src/app/dashboard/layout.tsx
"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { CircularProgress, Box } from "@mui/material";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Check authentication on component mount
  useEffect(() => {
    console.log("Dashboard layout mount, auth state:", {
      isLoading,
      isAuthenticated,
      user,
    });

    const verifyAuth = async () => {
      try {
        // Don't redirect immediately while checking auth
        if (!isLoading) {
          if (!isAuthenticated) {
            console.log("Not authenticated, redirecting to login");
            router.replace("/login");
          } else {
            console.log("User authenticated:", user);
          }
        }
      } catch (error) {
        console.error("Auth verification error:", error);
        router.replace("/login");
      }
    };

    verifyAuth();
  }, [isAuthenticated, isLoading, router, user]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, don't render dashboard content
  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
        <Box ml={2}>Checking authentication...</Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header onMenuToggle={toggleDrawer} />
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: "auto",
            backgroundColor: (theme) => theme.palette.background.default,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
