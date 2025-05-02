// src/app/dashboard/users/page.tsx

"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  Grid,
  useTheme,
  Breadcrumbs,
  Tooltip,
  Paper,
  CircularProgress,
  alpha,
  useMediaQuery,
  Fade,
} from "@mui/material";
import { useUsers } from "@/lib/hooks/api/useUsers";
import UserTable from "./UserTable";
import Link from "next/link";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, isFetching } = useUsers({ page, limit: pageSize });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page when changing page size
  };

  return (
    <Fade in={true} timeout={500}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={2}>
          {/* Header Section */}
          <Grid size={{ xs: 12 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
              sx={{ mb: 2, ml: 0.5 }}
            >
              <Link
                href="/dashboard"
                passHref
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} color="inherit" />
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{ fontSize: 14 }}
                >
                  Dashboard
                </Typography>
              </Link>
              <Typography
                color="text.primary"
                variant="body2"
                sx={{ fontSize: 14, fontWeight: "medium" }}
              >
                Users
              </Typography>
            </Breadcrumbs>

            {/* Page Header with Title and Actions */}
            <Card
              elevation={2}
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                borderRadius: 2,
                background: `linear-gradient(90deg, ${
                  theme.palette.background.paper
                } 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
                backdropFilter: "blur(8px)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PeopleOutlineIcon
                  sx={{
                    fontSize: 34,
                    mr: 2,
                    color: theme.palette.primary.main,
                  }}
                />
                <Box>
                  <Typography
                    variant="h5"
                    component="h1"
                    sx={{ fontWeight: "bold" }}
                  >
                    User Management
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {isLoading
                      ? "Loading users..."
                      : `Manage ${data?.meta?.total || 0} users in the system`}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                <Tooltip
                  title="View and restore deleted users"
                  arrow
                  placement="top"
                >
                  <Link href="/dashboard/users/trash" passHref>
                    <Button
                      variant="outlined"
                      startIcon={<RestoreFromTrashIcon />}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        borderRadius: 1.5,
                        whiteSpace: "nowrap",
                        minWidth: isMobile ? "auto" : undefined,
                        px: isMobile ? 1 : 2,
                      }}
                    >
                      {!isMobile ? "Deleted Users" : "Trash"}
                    </Button>
                  </Link>
                </Tooltip>

                <Tooltip
                  title="Create a new user account"
                  arrow
                  placement="top"
                >
                  <Link href="/dashboard/users/create" passHref>
                    <Button
                      variant="contained"
                      startIcon={<PersonAddAltIcon />}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        fontWeight: "medium",
                        borderRadius: 1.5,
                        whiteSpace: "nowrap",
                        minWidth: isMobile ? "auto" : undefined,
                        px: isMobile ? 1 : 2,
                        boxShadow: 2,
                      }}
                    >
                      {!isMobile ? "Add User" : "Add"}
                    </Button>
                  </Link>
                </Tooltip>
              </Box>
            </Card>
          </Grid>

          {/* Quick Stats (optional) */}
          {data?.meta && (
            <Grid size={{ xs: 12 }}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {[
                  {
                    title: "Total Users",
                    value: data.meta.total,
                    color: theme.palette.primary.main,
                    bgColor: alpha(theme.palette.primary.main, 0.1),
                  },
                  {
                    title: "Admins",
                    value: data.data.filter((user) => user.role === "admin")
                      .length,
                    color: theme.palette.error.main,
                    bgColor: alpha(theme.palette.error.main, 0.1),
                  },
                  {
                    title: "Editors",
                    value: data.data.filter((user) => user.role === "editor")
                      .length,
                    color: theme.palette.info.main,
                    bgColor: alpha(theme.palette.info.main, 0.1),
                  },
                  {
                    title: "Clients",
                    value: data.data.filter((user) => user.role === "client")
                      .length,
                    color: theme.palette.success.main,
                    bgColor: alpha(theme.palette.success.main, 0.1),
                  },
                ].map((stat, index) => (
                  <Grid size={{ xs: 6, sm: 3 }} key={index}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 2,
                        border: `1px solid ${alpha(stat.color, 0.2)}`,
                        backgroundColor: stat.bgColor,
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: 3,
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {stat.title}
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: "bold",
                          color: stat.color,
                        }}
                      >
                        {stat.value}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}

          {/* Main Table Section */}
          <Grid size={{ xs: 12 }}>
            {/* Refresh indicator */}
            {isFetching && !isLoading && (
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <Paper
                  elevation={2}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.info.light, 0.1),
                  }}
                >
                  <CircularProgress size={16} thickness={4} sx={{ mr: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Refreshing data...
                  </Typography>
                </Paper>
              </Box>
            )}

            <UserTable
              rows={data?.data || []}
              rowCount={data?.meta?.total || 0}
              page={page}
              pageSize={pageSize}
              loading={isLoading}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
}
