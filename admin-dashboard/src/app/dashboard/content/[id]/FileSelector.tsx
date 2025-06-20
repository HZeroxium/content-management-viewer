// /src/app/dashboard/content/[id]/FileSelector.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  Chip,
  Alert,
  Pagination,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Fade,
  Skeleton,
} from "@mui/material";
import { useFiles } from "@/lib/hooks/api/useFiles";
import SearchIcon from "@mui/icons-material/Search";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ClearIcon from "@mui/icons-material/Clear";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatFileSize } from "@/utils/format";

interface FileSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (fileId: string, fileUrl: string) => void;
  acceptTypes?: string[]; // "image", "video", etc.
}

export default function FileSelector({
  open,
  onClose,
  onSelect,
  acceptTypes = [],
}: FileSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const theme = useTheme();

  // Fetch files with pagination
  const { data, isLoading, error } = useFiles({
    page: currentPage,
    limit: pageSize,
  });

  // Filter files based on acceptTypes and search term
  const filteredFiles = React.useMemo(() => {
    if (!data?.data) return [];

    return data.data.filter((file) => {
      let passesTypeFilter = true;
      let passesSearchFilter = true;

      // Apply type filter
      if (acceptTypes.length > 0) {
        if (
          acceptTypes.includes("image") &&
          !file.contentType.startsWith("image/")
        ) {
          passesTypeFilter = false;
        }
        if (
          acceptTypes.includes("video") &&
          !file.contentType.startsWith("video/")
        ) {
          passesTypeFilter = false;
        }
        if (
          acceptTypes.includes("document") &&
          !file.contentType.includes("pdf") &&
          !file.contentType.includes("word") &&
          !file.contentType.includes("text/")
        ) {
          passesTypeFilter = false;
        }
      }

      // Apply search filter
      if (searchTerm) {
        passesSearchFilter =
          file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
          file.originalName.toLowerCase().includes(searchTerm.toLowerCase());
      }

      return passesTypeFilter && passesSearchFilter;
    });
  }, [data, searchTerm, acceptTypes]);

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedFile(null);
    }
  }, [open]);

  const handleSelectFile = (fileId: string) => {
    setSelectedFile(fileId);
  };

  const handleConfirm = () => {
    if (selectedFile) {
      const selectedFileData = data?.data.find(
        (file) => file.id === selectedFile
      );
      if (selectedFileData) {
        onSelect(selectedFile, selectedFileData.url);
      }
    }
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  // Get file type icon and label based on MIME type
  const getFileTypeInfo = (contentType: string) => {
    if (contentType.startsWith("image/")) {
      return {
        label: "Image",
        color: "success" as const,
        icon: <ImageIcon sx={{ fontSize: 40 }} />,
      };
    }
    if (contentType.startsWith("video/")) {
      return {
        label: "Video",
        color: "error" as const,
        icon: <VideocamIcon sx={{ fontSize: 40 }} />,
      };
    }
    if (contentType.includes("pdf")) {
      return {
        label: "PDF",
        color: "warning" as const,
        icon: <PictureAsPdfIcon sx={{ fontSize: 40 }} />,
      };
    }
    if (
      contentType.includes("word") ||
      contentType.includes("document") ||
      contentType.includes("text/")
    ) {
      return {
        label: "Document",
        color: "primary" as const,
        icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
      };
    }
    return {
      label: "Other",
      color: "default" as const,
      icon: <InsertDriveFileIcon sx={{ fontSize: 40 }} />,
    };
  };

  // Render file card skeleton while loading
  const renderSkeletons = () => (
    <Grid container spacing={2}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`skeleton-${index}`}>
          <Card sx={{ height: "100%" }}>
            <Skeleton variant="rectangular" height={140} animation="wave" />
            <CardContent>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="50%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      TransitionComponent={Fade}
      transitionDuration={300}
      PaperProps={{
        elevation: 8,
        sx: {
          borderRadius: 2,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: "medium",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "divider",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <CloudUploadIcon sx={{ mr: 1 }} />
          Select a File
          {acceptTypes.length > 0 && (
            <Chip
              label={acceptTypes
                .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
                .join(", ")}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ ml: 1 }}
            />
          )}
        </Box>

        <IconButton onClick={onClose} size="small" aria-label="close">
          <ClearIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: 3, borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 0 }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            label="Media Library"
            icon={<ImageIcon />}
            iconPosition="start"
            sx={{ minHeight: 64 }}
          />
          <Tab
            label="Upload New"
            icon={<CloudUploadIcon />}
            iconPosition="start"
            sx={{ minHeight: 64 }}
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {activeTab === 0 ? (
          <>
            {/* Search Bar */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm ? (
                    <InputAdornment position="end">
                      <Tooltip title="Clear search">
                        <IconButton
                          size="small"
                          onClick={() => setSearchTerm("")}
                          edge="end"
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ) : null,
                  sx: {
                    borderRadius: 2,
                    "&.Mui-focused": {
                      boxShadow: `0 0 0 2px ${alpha(
                        theme.palette.primary.main,
                        0.25
                      )}`,
                    },
                  },
                }}
                variant="outlined"
                size="medium"
              />
            </Box>

            {isLoading ? (
              renderSkeletons()
            ) : error ? (
              <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
                Error loading files:{" "}
                {error instanceof Error ? error.message : String(error)}
              </Alert>
            ) : filteredFiles.length === 0 ? (
              <Alert
                severity="info"
                variant="outlined"
                sx={{ mb: 2 }}
                icon={<SearchIcon />}
              >
                {searchTerm
                  ? `No files matching "${searchTerm}" were found.`
                  : "No files matching your criteria were found."}
              </Alert>
            ) : (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {filteredFiles.length} files found
                    {acceptTypes.length > 0 &&
                      ` (filtered to ${acceptTypes.join(", ")} files)`}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  {filteredFiles.map((file) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={file.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card
                          sx={{
                            cursor: "pointer",
                            border: selectedFile === file.id ? 2 : 1,
                            borderColor:
                              selectedFile === file.id
                                ? "primary.main"
                                : "divider",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            transition: "all 0.2s",
                            "&:hover": {
                              boxShadow: 4,
                              transform: "translateY(-4px)",
                            },
                            borderRadius: 2,
                          }}
                          onClick={() => handleSelectFile(file.id)}
                          elevation={selectedFile === file.id ? 4 : 1}
                        >
                          {selectedFile === file.id && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                zIndex: 1,
                                bgcolor: "primary.main",
                                color: "white",
                                borderRadius: "50%",
                                width: 24,
                                height: 24,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                fontSize: 16,
                                border: "2px solid white",
                              }}
                            >
                              ✓
                            </Box>
                          )}

                          {file.contentType.startsWith("image/") ? (
                            <CardMedia
                              component="img"
                              height="140"
                              image={file.url}
                              alt={file.filename}
                              sx={{
                                objectFit: "cover",
                                transition: "all 0.3s ease",
                                opacity: selectedFile === file.id ? 1 : 0.9,
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                height: 140,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: alpha(
                                  getFileTypeInfo(file.contentType).color === "default"
                                    ? theme.palette.grey[500]
                                    : theme.palette[
                                        getFileTypeInfo(file.contentType).color as keyof Pick<typeof theme.palette, 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'>
                                      ].main,
                                  0.1
                                ),
                                color: getFileTypeInfo(file.contentType).color === "default" ? "grey.600" : `${getFileTypeInfo(file.contentType).color}.main`,
                                transition: "all 0.2s",
                              }}
                            >
                              {getFileTypeInfo(file.contentType).icon}
                            </Box>
                          )}

                          <CardContent sx={{ flexGrow: 1, pb: 1, pt: 1.5 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                noWrap
                                title={file.filename}
                                sx={{
                                  fontWeight:
                                    selectedFile === file.id
                                      ? "medium"
                                      : "normal",
                                }}
                              >
                                {file.filename}
                              </Typography>
                              <Chip
                                label={getFileTypeInfo(file.contentType).label}
                                color={getFileTypeInfo(file.contentType).color}
                                size="small"
                                sx={{
                                  ml: 0.5,
                                  height: 24,
                                  fontSize: "0.7rem",
                                }}
                              />
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mt: 0.5,
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "block",
                                  textOverflow: "ellipsis",
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                  maxWidth: "80%",
                                }}
                                title={formatFileSize(file.size)}
                              >
                                {formatFileSize(file.size)}
                              </Typography>

                              <Tooltip title="Preview file in a new tab">
                                <IconButton
                                  component="a"
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  size="small"
                                  sx={{
                                    opacity: 0.7,
                                    "&:hover": { opacity: 1 },
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FileDownloadIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination */}
                {data && data.meta && data.meta.total > pageSize && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 3 }}
                  >
                    <Pagination
                      count={Math.ceil(data.meta.total / pageSize)}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      shape="rounded"
                      showFirstButton
                      showLastButton
                      size="large"
                    />
                  </Box>
                )}
              </>
            )}
          </>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: 300,
            }}
          >
            <Box
              sx={{
                mb: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                p: 3,
                borderRadius: 2,
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <CloudUploadIcon
                sx={{ fontSize: 60, color: "primary.main", mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                Upload a New File
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 400, mb: 3 }}
              >
                Go to the upload page to add new files to your media library.
                Supported formats include images, videos, PDFs, and documents.
              </Typography>
            </Box>
            <Link href="/dashboard/files/upload" passHref>
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                size="large"
                sx={{ borderRadius: 2, px: 4 }}
              >
                Go to File Upload
              </Button>
            </Link>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Tooltip
          title={!selectedFile ? "Select a file first" : "Use selected file"}
        >
          <span>
            <Button
              onClick={handleConfirm}
              disabled={!selectedFile}
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 3,
              }}
              color="primary"
            >
              Select
            </Button>
          </span>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
}
