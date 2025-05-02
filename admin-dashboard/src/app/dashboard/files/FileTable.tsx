// /src/app/dashboard/files/FileTable.tsx

"use client";

import React, { useState, useEffect } from "react";
import { FileResponseDto } from "@/lib/types/file";
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Tooltip,
  Skeleton,
  Paper,
  Fade,
  Divider,
  alpha,
} from "@mui/material";
import Link from "next/link";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ClearIcon from "@mui/icons-material/Clear";
import { useDeleteFile } from "@/lib/hooks/api/useFiles";
import { formatFileSize, formatDateTime } from "@/utils/format";

interface Props {
  rows: FileResponseDto[];
  rowCount: number;
  page: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  canDelete?: boolean;
  isTrashView?: boolean;
}

export default function FileTable({
  rows,
  rowCount,
  page,
  pageSize,
  loading,
  onPageChange,
  onPageSizeChange,
  canDelete = true,
  isTrashView = false,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRows, setFilteredRows] = useState<FileResponseDto[]>(rows);
  const [sortField, setSortField] = useState<keyof FileResponseDto>("filename");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [localFiltering, setLocalFiltering] = useState(false);
  const [hoverRowId, setHoverRowId] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [fileNameToDelete, setFileNameToDelete] = useState<string>("");
  const deleteFileMutation = useDeleteFile(fileToDelete || "");

  // Update filtered rows when rows or filters change
  useEffect(() => {
    const needsLocalFiltering = Boolean(searchTerm) || typeFilter !== "all";
    setLocalFiltering(needsLocalFiltering);

    if (needsLocalFiltering) {
      let result = [...rows];

      if (searchTerm) {
        result = result.filter(
          (file) =>
            file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
            file.originalName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (typeFilter !== "all") {
        result = result.filter((file) => {
          // Example: filter by mime type category (image, document, etc.)
          if (typeFilter === "image") {
            return file.contentType.startsWith("image/");
          }
          if (typeFilter === "document") {
            return (
              file.contentType.includes("pdf") ||
              file.contentType.includes("word") ||
              file.contentType.includes("excel") ||
              file.contentType.includes("text/")
            );
          }
          if (typeFilter === "video") {
            return file.contentType.startsWith("video/");
          }
          return true;
        });
      }

      // Apply sorting
      result.sort((a, b) => {
        let valueA = a[sortField];
        let valueB = b[sortField];

        if (sortField === "size") {
          // For number fields
          return sortDirection === "asc"
            ? Number(valueA) - Number(valueB)
            : Number(valueB) - Number(valueA);
        }

        if (sortField === "createdAt" || sortField === "updatedAt") {
          // For date fields
          return sortDirection === "asc"
            ? new Date(valueA as string).getTime() -
                new Date(valueB as string).getTime()
            : new Date(valueB as string).getTime() -
                new Date(valueA as string).getTime();
        }

        // For string fields
        if (typeof valueA === "string" && typeof valueB === "string") {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
          if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
          if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
        }

        return 0;
      });

      setFilteredRows(result);
    } else {
      setFilteredRows(rows);
    }
  }, [rows, searchTerm, typeFilter, sortField, sortDirection]);

  const displayedRows = localFiltering
    ? filteredRows.slice(0, pageSize)
    : filteredRows;

  const handleSort = (field: keyof FileResponseDto) => {
    setSortDirection((prev) =>
      field === sortField && prev === "asc" ? "desc" : "asc"
    );
    setSortField(field);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    onPageChange(newPage + 1);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onPageSizeChange(parseInt(event.target.value, 10));
    onPageChange(1);
  };

  const handleDeleteClick = (fileId: string, fileName: string) => {
    setFileToDelete(fileId);
    setFileNameToDelete(fileName);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (fileToDelete) {
      try {
        await deleteFileMutation.mutateAsync();
        setDeleteDialogOpen(false);
        setFileToDelete(null);
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setFileToDelete(null);
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

  // Render a skeleton loading row
  const renderSkeletonRow = (index: number) => (
    <TableRow key={`skeleton-${index}`}>
      <TableCell>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Skeleton variant="text" animation="wave" width="70%" height={24} />
          <Skeleton variant="text" animation="wave" width="50%" height={16} />
        </Box>
      </TableCell>
      <TableCell>
        <Skeleton
          variant="rounded"
          animation="wave"
          width={80}
          height={24}
          sx={{ borderRadius: 1 }}
        />
      </TableCell>
      {!isMobile && (
        <TableCell>
          <Skeleton variant="text" animation="wave" width={60} height={20} />
        </TableCell>
      )}
      {!isMobile && (
        <TableCell>
          <Skeleton variant="text" animation="wave" width={90} height={20} />
        </TableCell>
      )}
      <TableCell align="center">
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Skeleton
            variant="circular"
            animation="wave"
            width={30}
            height={30}
            sx={{ mx: 0.5 }}
          />
          <Skeleton
            variant="circular"
            animation="wave"
            width={30}
            height={30}
            sx={{ mx: 0.5 }}
          />
          <Skeleton
            variant="circular"
            animation="wave"
            width={30}
            height={30}
            sx={{ mx: 0.5 }}
          />
        </Box>
      </TableCell>
    </TableRow>
  );

  // Render empty state message
  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={isMobile ? 3 : 5} align="center" sx={{ py: 6 }}>
        <Box sx={{ textAlign: "center" }}>
          <InsertDriveFileIcon
            sx={{ fontSize: 60, color: "text.secondary", opacity: 0.4, mb: 1 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {localFiltering ? "No matching files" : "No files found"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {localFiltering
              ? "Try adjusting your search or filter criteria"
              : "Upload files to get started"}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );

  return (
    <Paper
      elevation={2}
      sx={{
        width: "100%",
        overflow: "hidden",
        borderRadius: 2,
        transition: "box-shadow 0.3s ease",
        "&:hover": {
          boxShadow: 4,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {/* Search Field */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Tooltip
              title="Search by filename or original name"
              arrow
              placement="top"
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by filename..."
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
                      <Tooltip title="Clear search" arrow>
                        <IconButton
                          size="small"
                          onClick={() => setSearchTerm("")}
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
              />
            </Tooltip>
          </Grid>

          {/* Filter by Type */}
          <Grid size={{ xs: 6, md: 3 }}>
            <Tooltip
              title="Filter files by type category"
              arrow
              placement="top"
            >
              <FormControl fullWidth>
                <InputLabel id="type-filter-label">File Type</InputLabel>
                <Select
                  labelId="type-filter-label"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterListIcon />
                    </InputAdornment>
                  }
                  sx={{
                    borderRadius: 2,
                    "&.Mui-focused": {
                      boxShadow: `0 0 0 2px ${alpha(
                        theme.palette.primary.main,
                        0.25
                      )}`,
                    },
                  }}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="image">Images</MenuItem>
                  <MenuItem value="document">Documents</MenuItem>
                  <MenuItem value="video">Videos</MenuItem>
                </Select>
              </FormControl>
            </Tooltip>
          </Grid>

          {/* Sort Field */}
          <Grid size={{ xs: 6, md: 3 }}>
            <Tooltip title="Sort files by selected field" arrow placement="top">
              <FormControl fullWidth>
                <InputLabel id="sort-field-label">Sort By</InputLabel>
                <Select
                  labelId="sort-field-label"
                  value={sortField}
                  onChange={(e) =>
                    handleSort(e.target.value as keyof FileResponseDto)
                  }
                  startAdornment={
                    <InputAdornment position="start">
                      <SortIcon />
                    </InputAdornment>
                  }
                  endAdornment={
                    <Tooltip
                      title={`Change to ${
                        sortDirection === "asc" ? "descending" : "ascending"
                      } order`}
                    >
                      <Box
                        component="span"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSortDirection((prev) =>
                            prev === "asc" ? "desc" : "asc"
                          );
                        }}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          mr: 1,
                          p: 0.5,
                          borderRadius: 1,
                          transition: "background-color 0.2s",
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        <Chip
                          label={sortDirection.toUpperCase()}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 24,
                            fontSize: "0.75rem",
                            fontWeight: "medium",
                          }}
                        />
                      </Box>
                    </Tooltip>
                  }
                  sx={{
                    borderRadius: 2,
                    "&.Mui-focused": {
                      boxShadow: `0 0 0 2px ${alpha(
                        theme.palette.primary.main,
                        0.25
                      )}`,
                    },
                  }}
                >
                  <MenuItem value="filename">Filename</MenuItem>
                  <MenuItem value="size">Size</MenuItem>
                  <MenuItem value="createdAt">Upload Date</MenuItem>
                  <MenuItem value="updatedAt">Last Modified</MenuItem>
                </Select>
              </FormControl>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>

      <Divider />

      <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                <Tooltip title="Filename and original name" arrow>
                  <span>Filename</span>
                </Tooltip>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                <Tooltip title="File type category" arrow>
                  <span>Type</span>
                </Tooltip>
              </TableCell>
              {!isMobile && (
                <TableCell
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  <Tooltip title="File size in bytes" arrow>
                    <span>Size</span>
                  </Tooltip>
                </TableCell>
              )}
              {!isMobile && (
                <TableCell
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  <Tooltip title="Date when file was uploaded" arrow>
                    <span>Uploaded</span>
                  </Tooltip>
                </TableCell>
              )}
              <TableCell
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: "white",
                  fontWeight: "bold",
                }}
                align="center"
              >
                <Tooltip title="Available actions" arrow>
                  <span>Actions</span>
                </Tooltip>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? // Skeleton loading for better UX during data fetch
                Array.from(new Array(pageSize || 5)).map((_, index) =>
                  renderSkeletonRow(index)
                )
              : displayedRows.length === 0
              ? renderEmptyState()
              : displayedRows.map((file) => (
                  <TableRow
                    key={file.id}
                    hover
                    onMouseEnter={() => setHoverRowId(file.id)}
                    onMouseLeave={() => setHoverRowId(null)}
                    sx={{
                      backgroundColor:
                        hoverRowId === file.id
                          ? alpha(theme.palette.primary.light, 0.08)
                          : "inherit",
                      transition: "background-color 0.2s ease",
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.light,
                          0.12
                        ),
                      },
                    }}
                  >
                    <TableCell sx={{ verticalAlign: "top" }}>
                      <Tooltip title={file.originalName} arrow placement="top">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "medium",
                            mb: 0.5,
                            color:
                              hoverRowId === file.id
                                ? theme.palette.primary.main
                                : "inherit",
                            transition: "color 0.2s ease",
                          }}
                        >
                          {file.filename}
                        </Typography>
                      </Tooltip>
                      <Typography variant="caption" color="text.secondary">
                        {file.originalName.length > 40
                          ? `${file.originalName.substring(0, 40)}...`
                          : file.originalName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip
                        title={`File type: ${file.contentType}`}
                        arrow
                        placement="top"
                      >
                        <Chip
                          label={getFileTypeInfo(file.contentType).label}
                          color={getFileTypeInfo(file.contentType).color}
                          size="small"
                          variant={
                            hoverRowId === file.id ? "filled" : "outlined"
                          }
                          sx={{ transition: "all 0.2s ease" }}
                        />
                      </Tooltip>
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        <Tooltip
                          title={`${file.size} bytes`}
                          arrow
                          placement="top"
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                hoverRowId === file.id
                                  ? "text.primary"
                                  : "text.secondary",
                              transition: "color 0.2s ease",
                              fontFamily: "monospace",
                            }}
                          >
                            {formatFileSize(file.size)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                    )}
                    {!isMobile && (
                      <TableCell>
                        <Tooltip
                          title={`Uploaded on: ${new Date(
                            file.createdAt
                          ).toLocaleString()}`}
                          arrow
                          placement="top"
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                hoverRowId === file.id
                                  ? "text.primary"
                                  : "text.secondary",
                              transition: "color 0.2s ease",
                            }}
                          >
                            {formatDateTime(file.createdAt)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                    )}
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          opacity: hoverRowId === file.id ? 1 : 0.7,
                          transition: "opacity 0.3s ease",
                        }}
                      >
                        {/* View File Button */}
                        <Tooltip
                          title="View file in new tab"
                          arrow
                          placement="top"
                        >
                          <IconButton
                            size="small"
                            color="info"
                            component="a"
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              mx: 0.5,
                              transition:
                                "transform 0.2s ease, background-color 0.2s ease",
                              "&:hover": {
                                transform: "scale(1.1)",
                                backgroundColor: alpha(
                                  theme.palette.info.main,
                                  0.1
                                ),
                              },
                            }}
                          >
                            <VisibilityIcon
                              fontSize={isTablet ? "small" : "medium"}
                            />
                          </IconButton>
                        </Tooltip>

                        {/* Edit File Button */}
                        <Tooltip
                          title="Edit file details"
                          arrow
                          placement="top"
                        >
                          <IconButton
                            component={Link}
                            href={`/dashboard/files/${file.id}`}
                            size="small"
                            color="primary"
                            sx={{
                              mx: 0.5,
                              transition:
                                "transform 0.2s ease, background-color 0.2s ease",
                              "&:hover": {
                                transform: "scale(1.1)",
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.1
                                ),
                              },
                            }}
                          >
                            <EditIcon
                              fontSize={isTablet ? "small" : "medium"}
                            />
                          </IconButton>
                        </Tooltip>

                        {/* Delete File Button (if can delete) */}
                        {canDelete && !isTrashView && (
                          <Tooltip
                            title="Move file to trash"
                            arrow
                            placement="top"
                          >
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                handleDeleteClick(file.id, file.filename)
                              }
                              sx={{
                                mx: 0.5,
                                transition:
                                  "transform 0.2s ease, background-color 0.2s ease",
                                "&:hover": {
                                  transform: "scale(1.1)",
                                  backgroundColor: alpha(
                                    theme.palette.error.main,
                                    0.1
                                  ),
                                },
                              }}
                            >
                              <DeleteIcon
                                fontSize={isTablet ? "small" : "medium"}
                              />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={localFiltering ? filteredRows.length : rowCount}
        rowsPerPage={pageSize}
        page={page - 1}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={!isTablet ? "Rows per page:" : ""}
        labelDisplayedRows={({ from, to, count }) => (
          <Typography variant="body2" sx={{ fontWeight: "medium" }}>
            {from}-{to} of {count}
          </Typography>
        )}
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          ".MuiTablePagination-selectLabel, .MuiTablePagination-input": {
            fontWeight: "medium",
          },
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        TransitionComponent={Fade}
        transitionDuration={300}
        PaperProps={{
          elevation: 8,
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ fontWeight: "medium", pb: 1 }}>
          Delete File
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this file? This action will move the
            file to the trash.
          </DialogContentText>

          {fileNameToDelete && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: alpha(theme.palette.error.light, 0.1),
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle2" color="error.main">
                File to delete: "{fileNameToDelete}"
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
            disabled={deleteFileMutation.isPending}
            startIcon={<DeleteIcon />}
            sx={{ borderRadius: 1 }}
          >
            {deleteFileMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
