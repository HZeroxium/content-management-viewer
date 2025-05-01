// /src/app/dashboard/files/upload/page.tsx

"use client";

import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  TextField,
  Breadcrumbs,
  CircularProgress,
  LinearProgress,
  Paper,
  Alert,
  AlertTitle,
  Switch,
  FormControlLabel,
  Divider,
} from "@mui/material";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { UploadFileDto } from "@/lib/types/file";
import { useUploadFile } from "@/lib/hooks/api/useFiles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SettingsIcon from "@mui/icons-material/Settings";
import FolderIcon from "@mui/icons-material/Folder";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setFilesError, clearFilesError } from "@/lib/store/slices/files.slice";

interface UploadForm extends UploadFileDto {
  file: FileList;
}

export default function FileUploadPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const filesError = useAppSelector((state) => state.files.error);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const uploadFileMutation = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    control,
    handleSubmit,
    formState: {  },
    reset,
  } = useForm<UploadForm>({
    defaultValues: {
      folder: "",
      fileName: "",
      isPrivate: false,
    },
  });

  // Reset the form and state when the component unmounts or when a file is successfully uploaded
  React.useEffect(() => {
    return () => {
      dispatch(clearFilesError());
      setUploadProgress(0);
      setSelectedFile(null);
    };
  }, [dispatch]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      dispatch(clearFilesError());
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      e.type === "dragenter" ||
      e.type === "dragleave" ||
      e.type === "dragover"
    ) {
      setDragActive(e.type === "dragenter" || e.type === "dragover");
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      dispatch(clearFilesError());
    }
  };

  // Handle form submission
  const onSubmit: SubmitHandler<UploadForm> = async (data) => {
    if (!selectedFile) {
      dispatch(setFilesError("Please select a file to upload"));
      return;
    }

    try {
      dispatch(clearFilesError());
      setUploadProgress(0);

      // Create a unique ID for this upload to track progress
      // const uploadId = Date.now().toString();

      // Simulate progress updates (in a real app, you'd get these from your upload API)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 99) {
            clearInterval(progressInterval);
            return 99;
          }
          return prev + 5;
        });
      }, 300);

      // Prepare upload data
      const uploadData: UploadFileDto = {
        folder: data.folder || undefined,
        fileName: data.fileName || undefined,
        isPrivate: data.isPrivate,
      };

      // Execute file upload
      await uploadFileMutation.mutateAsync({
        file: selectedFile,
        dto: uploadData,
      });

      // Clear the interval and set progress to 100% when done
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Reset the form and state after successful upload
      setTimeout(() => {
        reset();
        setSelectedFile(null);
        setUploadProgress(0);
        router.push("/dashboard/files");
      }, 1000);
    } catch (error) {
      console.error("File upload error:", error);

      let errorMessage = "Failed to upload file. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        errorMessage = String((error as Error).message);
      }

      dispatch(setFilesError(errorMessage));
      setUploadProgress(0);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Breadcrumbs sx={{ mb: 2 }}>
              <Link href="/dashboard" style={{ textDecoration: "none" }}>
                Dashboard
              </Link>
              <Link href="/dashboard/files" style={{ textDecoration: "none" }}>
                Files
              </Link>
              <Typography color="text.primary">Upload File</Typography>
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
                Upload New File
              </Typography>
              <Link href="/dashboard/files" passHref>
                <Button startIcon={<ArrowBackIcon />} variant="outlined">
                  Back to Files
                </Button>
              </Link>
            </Box>

            {filesError && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                onClose={() => dispatch(clearFilesError())}
              >
                <AlertTitle>Error</AlertTitle>
                {filesError}
              </Alert>
            )}

            {uploadFileMutation.isSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                <AlertTitle>Success</AlertTitle>
                File uploaded successfully! Redirecting to files list...
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                {/* File Drop Zone */}
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      border: `2px dashed ${
                        dragActive ? "primary.main" : "grey.400"
                      }`,
                      borderRadius: 2,
                      p: 3,
                      bgcolor: dragActive ? "action.hover" : "background.paper",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 200,
                      transition: "all 0.2s ease",
                    }}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />

                    {selectedFile ? (
                      <>
                        <Typography variant="h6" gutterBottom>
                          Selected File:
                        </Typography>
                        <Typography>{selectedFile.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </Typography>
                        <Button
                          variant="outlined"
                          color="primary"
                          sx={{ mt: 2 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                        >
                          Change File
                        </Button>
                      </>
                    ) : (
                      <>
                        <CloudUploadIcon
                          sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
                        />
                        <Typography variant="h6" gutterBottom>
                          Drag and drop a file here
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          or click to select a file
                        </Typography>
                      </>
                    )}
                  </Box>
                </Grid>

                {/* Toggle Advanced Settings */}
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <SettingsIcon color="action" sx={{ mr: 1 }} />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showAdvanced}
                          onChange={(e) => setShowAdvanced(e.target.checked)}
                        />
                      }
                      label="Advanced Options"
                    />
                  </Box>
                  {showAdvanced && <Divider sx={{ my: 2 }} />}
                </Grid>

                {/* Advanced Options (only visible when showAdvanced is true) */}
                {showAdvanced && (
                  <>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller
                        name="fileName"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            label="Custom Filename (optional)"
                            fullWidth
                            placeholder="Leave blank to use original filename"
                            {...field}
                            helperText="Rename file on the server (without extension)"
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller
                        name="folder"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            label="Folder Path (optional)"
                            fullWidth
                            placeholder="e.g., images/profile"
                            InputProps={{
                              startAdornment: (
                                <FolderIcon color="action" sx={{ mr: 1 }} />
                              ),
                            }}
                            {...field}
                            helperText="Specify a subfolder to organize your files"
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name="isPrivate"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={field.value}
                                onChange={(e) =>
                                  field.onChange(e.target.checked)
                                }
                              />
                            }
                            label="Private File (requires authentication to access)"
                          />
                        )}
                      />
                    </Grid>
                  </>
                )}

                {/* Upload Progress Bar */}
                {uploadProgress > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Upload Progress: {uploadProgress}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                      sx={{ height: 10, borderRadius: 1 }}
                    />
                  </Grid>
                )}

                {/* Submit Button */}
                <Grid size={{ xs: 12 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={!selectedFile || uploadFileMutation.isPending}
                    startIcon={
                      uploadFileMutation.isPending ? (
                        <CircularProgress size={20} />
                      ) : (
                        <CloudUploadIcon />
                      )
                    }
                  >
                    {uploadFileMutation.isPending
                      ? "Uploading..."
                      : "Upload File"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
