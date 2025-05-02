// /src/app/dashboard/files/trash/page.tsx

"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  useTheme,
  Tooltip,
} from "@mui/material";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { formatFileSize, formatDateTime } from "@/utils/format";
import {
  useFiles,
  useRestoreFile,
  usePermanentDeleteFile,
} from "@/lib/hooks/api/useFiles";

export default function DeletedFilesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, error } = useFiles({
    page,
    limit: pageSize,
    deleted: true, // This will need to be handled by your API to fetch deleted files
  });
  const theme = useTheme();

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] =
    useState(false);

  const restoreFileMutation = useRestoreFile(selectedFileId || "");
  const permanentDeleteFileMutation = usePermanentDeleteFile(
    selectedFileId || ""
  );

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage + 1);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleRestoreClick = (fileId: string) => {
    setSelectedFileId(fileId);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (selectedFileId) {
      try {
        await restoreFileMutation.mutateAsync();
        setRestoreDialogOpen(false);
        setSelectedFileId(null);
      } catch (error) {
        console.error("Error restoring file:", error);
      }
    }
  };

  const handlePermanentDeleteClick = (fileId: string) => {
    setSelectedFileId(fileId);
    setPermanentDeleteDialogOpen(true);
  };

  const handlePermanentDeleteConfirm = async () => {
    if (selectedFileId) {
      try {
        await permanentDeleteFileMutation.mutateAsync();
        setPermanentDeleteDialogOpen(false);
        setSelectedFileId(null);
      } catch (error) {
        console.error("Error permanently deleting file:", error);
      }
    }
  };

  // Get file type icon and color based on MIME type
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
    if (contentType.includes("excel") || contentType.includes("spreadsheet")) {
      return { label: "Spreadsheet", color: "info" };
    }
    return { label: "Other", color: "default" };
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5" component="h1" sx={{ fontWeight: "bold" }}>
              Deleted Files
            </Typography>
            <Link href="/dashboard/files" passHref>
              <Button startIcon={<ArrowBackIcon />} variant="outlined">
                Back to Files
              </Button>
            </Link>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                  <TableRow>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Filename
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Type
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Size
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Deleted At
                    </TableCell>
                    <TableCell
                      sx={{ color: "white", fontWeight: "bold" }}
                      align="center"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Error loading files:{" "}
                        {error instanceof Error
                          ? error.message
                          : "Unknown error"}
                      </TableCell>
                    </TableRow>
                  ) : data?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No deleted files found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.data.map((file) => (
                      <TableRow key={file.id} hover>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "medium", mb: 0.5 }}
                          >
                            {file.filename}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {file.originalName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getFileTypeInfo(file.contentType).label}
                            color={getFileTypeInfo(file.contentType).color}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{formatFileSize(file.size)}</TableCell>
                        <TableCell>
                          {file.deletedAt
                            ? formatDateTime(file.deletedAt)
                            : "N/A"}
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{ display: "flex", justifyContent: "center" }}
                          >
                            {/* Preview Button */}
                            <Tooltip title="View File">
                              <IconButton
                                size="small"
                                color="info"
                                component="a"
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>

                            {/* Restore Button */}
                            <Tooltip title="Restore File">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleRestoreClick(file.id)}
                                disabled={restoreFileMutation.isPending}
                              >
                                <RestoreIcon />
                              </IconButton>
                            </Tooltip>

                            {/* Permanent Delete Button */}
                            <Tooltip title="Delete Permanently">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  handlePermanentDeleteClick(file.id)
                                }
                                disabled={permanentDeleteFileMutation.isPending}
                              >
                                <DeleteForeverIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={data?.meta?.total || 0}
              rowsPerPage={pageSize}
              page={page - 1}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handlePageSizeChange}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Restore Confirmation Dialog */}
      <Dialog
        open={restoreDialogOpen}
        onClose={() => setRestoreDialogOpen(false)}
      >
        <DialogTitle>Restore File</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to restore this file?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRestoreConfirm}
            color="primary"
            autoFocus
            disabled={restoreFileMutation.isPending}
          >
            {restoreFileMutation.isPending ? "Restoring..." : "Restore"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permanent Delete Confirmation Dialog */}
      <Dialog
        open={permanentDeleteDialogOpen}
        onClose={() => setPermanentDeleteDialogOpen(false)}
      >
        <DialogTitle>Permanent Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Warning: This action cannot be undone. Are you sure you want to
            permanently delete this file?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermanentDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePermanentDeleteConfirm}
            color="error"
            autoFocus
            disabled={permanentDeleteFileMutation.isPending}
          >
            {permanentDeleteFileMutation.isPending
              ? "Deleting..."
              : "Delete Permanently"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
