// /src/app/dashboard/files/[id]/page.tsx

"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Breadcrumbs,
  Stack,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Switch,
  FormControlLabel,
  Divider,
  Card,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  useFile,
  useUpdateFile,
  useDeleteFile,
} from "@/lib/hooks/api/useFiles";
import { UpdateFileDto } from "@/lib/types/file";
import { formatFileSize, formatDateTime } from "@/lib/utils/format";
import Image from "next/image";

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function FileDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { data: file, isLoading } = useFile(id);
  const updateFileMutation = useUpdateFile(id);
  const deleteFileMutation = useDeleteFile(id);

  const [updateError, setUpdateError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateFileDto>({
    filename: "",
    folder: "",
    isPrivate: false,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Update form data when file details are loaded
  React.useEffect(() => {
    if (file) {
      setFormData({
        filename: file.filename,
        folder: file.folder || "",
        isPrivate: file.isPrivate,
      });
    }
  }, [file]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === "isPrivate" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setUpdateError(null);
      await updateFileMutation.mutateAsync(formData);
      router.push("/dashboard/files");
    } catch (error) {
      console.error("Error updating file:", error);

      let errorMessage = "Failed to update file. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        const apiError = error as ApiErrorResponse;
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      }

      setUpdateError(errorMessage);
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteFileMutation.mutateAsync();
      setDeleteDialogOpen(false);
      router.push("/dashboard/files");
    } catch (error) {
      console.error("Error deleting file:", error);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!file) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          File not found
        </Typography>
        <Button
          component={Link}
          href="/dashboard/files"
          variant="outlined"
          sx={{ mt: 2 }}
        >
          Back to Files
        </Button>
      </Box>
    );
  }

  const isImage = file.contentType.startsWith("image/");
  const isVideo = file.contentType.startsWith("video/");
  const isAudio = file.contentType.startsWith("audio/");
  const isPDF = file.contentType === "application/pdf";

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Breadcrumbs sx={{ mb: 2 }}>
              <Link
                href="/dashboard"
                passHref
                style={{ textDecoration: "none" }}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/files"
                passHref
                style={{ textDecoration: "none" }}
              >
                Files
              </Link>
              <Typography color="text.primary">Edit File</Typography>
            </Breadcrumbs>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h5" component="h1">
                Edit File: {file.filename}
              </Typography>
              <Link href="/dashboard/files" passHref>
                <Button startIcon={<ArrowBackIcon />} variant="outlined">
                  Back to Files
                </Button>
              </Link>
            </Box>

            {updateError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {updateError}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    label="Filename"
                    fullWidth
                    name="filename"
                    value={formData.filename}
                    onChange={handleChange}
                    margin="normal"
                    required
                  />

                  <TextField
                    label="Folder"
                    fullWidth
                    name="folder"
                    value={formData.folder}
                    onChange={handleChange}
                    margin="normal"
                    placeholder="e.g., images/blog"
                    helperText="Leave empty for root folder"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        name="isPrivate"
                        checked={formData.isPrivate}
                        onChange={handleChange}
                        color="primary"
                      />
                    }
                    label="Private file (requires authentication to access)"
                    sx={{ mt: 2, mb: 1 }}
                  />

                  <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={updateFileMutation.isPending}
                      startIcon={<SaveIcon />}
                    >
                      {updateFileMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>
                    <Button
                      variant="outlined"
                      component={Link}
                      href="/dashboard/files"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleDelete}
                    >
                      Delete File
                    </Button>
                  </Stack>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    File Preview
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    {isImage ? (
                      <Box sx={{ position: "relative", height: 200, mb: 2 }}>
                        <Image
                          src={file.url}
                          alt={file.filename}
                          fill
                          style={{ objectFit: "contain" }}
                        />
                      </Box>
                    ) : isVideo ? (
                      <video
                        controls
                        src={file.url}
                        style={{ maxWidth: "100%", maxHeight: 200 }}
                      />
                    ) : isAudio ? (
                      <audio
                        controls
                        src={file.url}
                        style={{ width: "100%" }}
                      />
                    ) : isPDF ? (
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h1"
                          sx={{ fontSize: 60, color: "error.main" }}
                        >
                          PDF
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h1" sx={{ fontSize: 60 }}>
                          📄
                        </Typography>
                      </Box>
                    )}

                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                      sx={{ mt: 1 }}
                    >
                      <Button
                        startIcon={<VisibilityIcon />}
                        variant="outlined"
                        size="small"
                        onClick={() => window.open(file.url, "_blank")}
                      >
                        View
                      </Button>

                      <Button
                        startIcon={<FileDownloadIcon />}
                        variant="outlined"
                        size="small"
                        component="a"
                        href={file.url}
                        download={file.filename}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </Button>
                    </Stack>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Typography variant="subtitle2" gutterBottom>
                    File Information
                  </Typography>

                  <Grid container spacing={1}>
                    <Grid size={{ xs: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Original Name:
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 8 }}>
                      <Typography variant="body2">
                        {file.originalName}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Type:
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 8 }}>
                      <Typography variant="body2">
                        {file.contentType}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Size:
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 8 }}>
                      <Typography variant="body2">
                        {formatFileSize(file.size)}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Uploaded:
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 8 }}>
                      <Typography variant="body2">
                        {formatDateTime(file.createdAt)}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Last Modified:
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 8 }}>
                      <Typography variant="body2">
                        {formatDateTime(file.updatedAt)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete file {file.filename}? This action
            will move the file to trash.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            autoFocus
            disabled={deleteFileMutation.isPending}
          >
            {deleteFileMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
