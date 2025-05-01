// src/app/dashboard/layout.tsx
"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { Box, CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only check after loading is complete
    // This prevents premature redirects
    if (!isAuthLoading) {
      // Only redirect if explicitly not authenticated
      if (isAuthenticated === false) {
        router.replace("/login");
        return;
      }

      // Only check role when we have confirmed authentication
      if (isAuthenticated === true && user) {
        if (user.role !== "admin" && user.role !== "editor") {
          router.replace("/login");
        }
      }
    }
  }, [isAuthenticated, user, router, isAuthLoading]);

  // Show loading state while authentication is being determined
  if (isAuthLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Don't render dashboard content until we're sure about authentication
  if (isAuthenticated === false) {
    return null;
  }

  return (
    <Grid container>
      <Grid size={{ xs: 12, md: 2 }}>
        <Sidebar />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <TopBar />
        {children}
      </Grid>
    </Grid>
  );
}
