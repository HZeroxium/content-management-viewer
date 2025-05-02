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
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Alert,
  Pagination,
} from "@mui/material";
import { useFiles } from "@/lib/hooks/api/useFiles";
import SearchIcon from "@mui/icons-material/Search";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { formatFileSize } from "@/utils/format";
import Link from "next/link";

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

  // Get file type label and color
  const getFileTypeInfo = (
    contentType: string
  ): {
    label: string;
    color:
      | "default"
      | "primary"
      | "secondary"
      | "error"
      | "info"
      | "success"
      | "warning";
  } => {
    if (contentType.startsWith("image/")) {
      return { label: "Image", color: "success" };
    }
    if (contentType.startsWith("video/")) {
      return { label: "Video", color: "error" };
    }
    if (contentType.includes("pdf")) {
      return { label: "PDF", color: "warning" };
    }
    if (
      contentType.includes("word") ||
      contentType.includes("document") ||
      contentType.includes("text/")
    ) {
      return { label: "Document", color: "primary" };
    }
    return { label: "Other", color: "default" };
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Select a File</DialogTitle>

      <Box sx={{ px: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab label="Media Library" />
          <Tab label="Upload New" />
        </Tabs>
      </Box>

      <DialogContent>
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
                }}
              />
            </Box>

            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">
                Error loading files:{" "}
                {error instanceof Error ? error.message : String(error)}
              </Alert>
            ) : filteredFiles.length === 0 ? (
              <Alert severity="info">
                No files matching your criteria were found.
              </Alert>
            ) : (
              <>
                <Grid container spacing={2}>
                  {filteredFiles.map((file) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={file.id}>
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
                        }}
                        onClick={() => handleSelectFile(file.id)}
                      >
                        {file.contentType.startsWith("image/") ? (
                          <CardMedia
                            component="img"
                            height="140"
                            image={file.url}
                            alt={file.filename}
                            sx={{ objectFit: "cover" }}
                          />
                        ) : (
                          <Box
                            sx={{
                              height: 140,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "action.hover",
                            }}
                          >
                            <Chip
                              label={getFileTypeInfo(file.contentType).label}
                              color={getFileTypeInfo(file.contentType).color}
                            />
                          </Box>
                        )}
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" noWrap>
                            {file.filename}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(file.size)}
                          </Typography>
                        </CardContent>
                      </Card>
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
                    />
                  </Box>
                )}
              </>
            )}
          </>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Upload a New File
            </Typography>
            <Link href="/dashboard/files/upload" passHref>
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                sx={{ mt: 2 }}
              >
                Go to File Upload
              </Button>
            </Link>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          disabled={!selectedFile}
          variant="contained"
        >
          Select
        </Button>
      </DialogActions>
    </Dialog>
  );
}
