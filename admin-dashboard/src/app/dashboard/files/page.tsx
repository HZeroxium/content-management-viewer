// /src/app/dashboard/files/page.tsx

"use client";

import React, { useState } from "react";
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
import { useFiles } from "@/lib/hooks/api/useFiles";
import FileTable from "./FileTable";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import FolderIcon from "@mui/icons-material/Folder";
import { formatFileSize } from "@/utils/format";

export default function FilesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, error, isFetching } = useFiles({
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

  // Calculate statistics from data
  const calculateTotalSize = () => {
    if (!data?.data) return 0;
    return data.data.reduce((sum, file) => sum + (file.size || 0), 0);
  };

  const getFileTypeCount = (type: string) => {
    if (!data?.data) return 0;
    return data.data.filter((file) => {
      if (type === "image") return file.contentType.startsWith("image/");
      if (type === "document")
        return (
          file.contentType.includes("pdf") ||
          file.contentType.includes("word") ||
          file.contentType.includes("text/")
        );
      if (type === "video") return file.contentType.startsWith("video/");
      return false;
    }).length;
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
                File Management
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
                <FolderIcon
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
                    File Management
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {isLoading
                      ? "Loading files..."
                      : `Manage ${data?.meta?.total || 0} files in the system`}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                <Tooltip
                  title="View and restore deleted files"
                  arrow
                  placement="top"
                >
                  <Link href="/dashboard/files/trash" passHref>
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

                <Tooltip title="Upload a new file" arrow placement="top">
                  <Link href="/dashboard/files/upload" passHref>
                    <Button
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
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
                      {!isMobile ? "Upload File" : "Upload"}
                    </Button>
                  </Link>
                </Tooltip>
              </Box>
            </Card>
          </Grid>

          {/* File Statistics Cards (if data available) */}
          {!isLoading && data?.meta && (
            <Grid size={{ xs: 12 }}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {/* Total Files Card */}
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
                      Total Files
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

                {/* Total Size Card */}
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
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
                      Total Size
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "medium",
                        color: theme.palette.info.main,
                      }}
                    >
                      {formatFileSize(calculateTotalSize())}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Images Count */}
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
                      Images
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={getFileTypeCount("image")}
                        size="small"
                        color="success"
                      />
                    </Box>
                  </Paper>
                </Grid>

                {/* Documents Count */}
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
                      Documents
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={getFileTypeCount("document")}
                        size="small"
                        color="warning"
                      />
                    </Box>
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
                Error loading files:{" "}
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

          {/* File Table */}
          <Grid size={{ xs: 12 }}>
            <FileTable
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
