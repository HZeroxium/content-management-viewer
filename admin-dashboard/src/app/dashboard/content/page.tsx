// src/app/dashboard/content/page.tsx

"use client";

import React, { useState } from "react";
import { useContents } from "@/lib/hooks/api/useContents";
import {
  Box,
  Button,
  Typography,
  Card,
  Grid,
  Alert,
  useTheme,
  Breadcrumbs,
  Link as MuiLink,
  Tooltip,
  CircularProgress,
  Paper,
  useMediaQuery,
  alpha,
  Fade,
  Chip,
} from "@mui/material";
import Link from "next/link";
import ContentTable from "./ContentTable";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import DescriptionIcon from "@mui/icons-material/Description";
import { formatDateTime } from "@/utils/format";

export default function ContentListPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, error, isFetching } = useContents({
    page,
    limit: pageSize,
  });

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
        <Grid container spacing={3}>
          {/* Breadcrumb Navigation */}
          <Grid size={{ xs: 12 }}>
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
              sx={{ mb: 2, ml: 0.5 }}
            >
              <Link href="/dashboard" passHref>
                <MuiLink
                  underline="hover"
                  color="inherit"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />
                  Dashboard
                </MuiLink>
              </Link>
              <Typography color="text.primary" sx={{ fontWeight: "medium" }}>
                Content Management
              </Typography>
            </Breadcrumbs>
          </Grid>

          {/* Header Card */}
          <Grid size={{ xs: 12 }}>
            <Card
              elevation={2}
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                borderRadius: 2,
                background: `linear-gradient(90deg, ${
                  theme.palette.background.paper
                } 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
                backdropFilter: "blur(8px)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <DescriptionIcon
                  sx={{
                    fontSize: 32,
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
                    Content Management
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {isLoading
                      ? "Loading content..."
                      : `Manage ${data?.meta?.total || 0} content items`}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                <Tooltip
                  title="View and restore deleted content"
                  arrow
                  placement="top"
                >
                  <Link href="/dashboard/content/trash" passHref>
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
                      {!isMobile ? "Trash" : ""}
                    </Button>
                  </Link>
                </Tooltip>

                <Tooltip title="Create new content item" arrow placement="top">
                  <Link href="/dashboard/content/create" passHref>
                    <Button
                      variant="contained"
                      startIcon={<AddCircleOutlineIcon />}
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
                      {!isMobile ? "Create Content" : "Create"}
                    </Button>
                  </Link>
                </Tooltip>
              </Box>
            </Card>
          </Grid>

          {/* Content Statistics Cards (if data available) */}
          {!isLoading && data?.meta && (
            <Grid size={{ xs: 12 }}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {/* Total Contents Card */}
                <Grid size={{ xs: 6, sm: 3 }}>
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
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.2
                      )}`,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 2,
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Total Content
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.primary.main,
                      }}
                    >
                      {data.meta.total}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Recently Updated Card */}
                <Grid size={{ xs: 6, sm: 3 }}>
                  {data.data[0] && (
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        borderRadius: 2,
                        border: `1px solid ${alpha(
                          theme.palette.info.main,
                          0.2
                        )}`,
                        backgroundColor: alpha(theme.palette.info.main, 0.05),
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: 2,
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Recently Updated
                      </Typography>
                      <Tooltip
                        title={formatDateTime(data.data[0].updatedAt || "")}
                        arrow
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "medium",
                            color: theme.palette.info.main,
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {data.data[0].title}
                        </Typography>
                      </Tooltip>
                    </Paper>
                  )}
                </Grid>

                {/* Pages & Limit indicators */}
                <Grid size={{ xs: 6, sm: 3 }}>
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
                      border: `1px solid ${alpha(
                        theme.palette.success.main,
                        0.2
                      )}`,
                      backgroundColor: alpha(theme.palette.success.main, 0.05),
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 2,
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Current Page
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={`${page} of ${Math.ceil(
                          (data?.meta?.total || 0) / pageSize
                        )}`}
                        size="small"
                        color="success"
                      />
                    </Box>
                  </Paper>
                </Grid>

                {/* Page Size Display */}
                <Grid size={{ xs: 6, sm: 3 }}>
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
                      border: `1px solid ${alpha(
                        theme.palette.warning.main,
                        0.2
                      )}`,
                      backgroundColor: alpha(theme.palette.warning.main, 0.05),
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 2,
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Items Per Page
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.warning.main,
                      }}
                    >
                      {pageSize}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          )}

          {/* Error Display */}
          {error && (
            <Grid size={{ xs: 12 }}>
              <Alert
                severity="error"
                variant="filled"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  "& .MuiAlert-message": {
                    fontWeight: "medium",
                  },
                }}
              >
                Error loading content:{" "}
                {error instanceof Error ? error.message : String(error)}
              </Alert>
            </Grid>
          )}

          {/* Refresh indicator */}
          {isFetching && !isLoading && (
            <Grid size={{ xs: 12 }}>
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
            </Grid>
          )}

          {/* Content Table */}
          <Grid size={{ xs: 12 }}>
            <ContentTable
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
