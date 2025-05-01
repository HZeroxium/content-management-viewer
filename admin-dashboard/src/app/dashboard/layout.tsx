// src/app/dashboard/layout.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAppAuth } from "@/lib/hooks/useAppAuth";
import { useRouter } from "next/navigation";
import { CircularProgress, Box } from "@mui/material";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setSidebarOpen } from "@/lib/store/slices/ui.slice";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, isAuthenticationFailed, user } =
    useAppAuth();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  // Add state to prevent multiple redirects
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Check authentication on component mount or when auth state changes
  useEffect(() => {
    console.log("Dashboard layout auth state:", {
      isLoading,
      isAuthenticated,
      isAuthenticationFailed,
      user,
    });

    // Only redirect if we're not already redirecting, not loading, and not authenticated
    if (!isLoading && !isAuthenticated && !isRedirecting) {
      console.log("Not authenticated in dashboard, redirecting to login");
      setIsRedirecting(true);

      // Use a short timeout to ensure the redirect happens after state updates complete
      setTimeout(() => {
        router.replace("/login");
      }, 100);
    }
  }, [
    isAuthenticated,
    isLoading,
    isAuthenticationFailed,
    router,
    user,
    isRedirecting,
  ]);

  const toggleDrawer = () => {
    dispatch(setSidebarOpen(!sidebarOpen));
  };

  // Show loading state while checking auth
  if (isLoading || (!isAuthenticated && !isRedirecting)) {
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
        <Box ml={2}>
          {isLoading ? "Checking authentication..." : "Redirecting to login..."}
        </Box>
      </Box>
    );
  }

  // Only render the dashboard if authenticated
  if (!isAuthenticated) {
    // This is a fallback in case the redirect doesn't happen immediately
    return null;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header onMenuToggle={toggleDrawer} />
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar
          open={sidebarOpen}
          onClose={() => dispatch(setSidebarOpen(false))}
        />
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
