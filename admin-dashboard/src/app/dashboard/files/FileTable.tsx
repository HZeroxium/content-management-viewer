// /src/app/dashboard/files/FileTable.tsx

"use client";

import React, { useState, useEffect } from "react";
import { FileResponseDto } from "@/lib/types/file";
import {
  Box,
  Card,
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
} from "@mui/material";
import Link from "next/link";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useDeleteFile } from "@/lib/hooks/api/useFiles";
import { formatFileSize, formatDateTime } from "@/lib/utils/format";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRows, setFilteredRows] = useState<FileResponseDto[]>(rows);
  const [sortField, setSortField] = useState<keyof FileResponseDto>("filename");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [localFiltering, setLocalFiltering] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
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

  const handleDeleteClick = (fileId: string) => {
    setFileToDelete(fileId);
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
  ): { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } => {
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
    <Box sx={{ width: "100%" }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Search Field */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by filename"
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
        </Grid>

        {/* Filter by Type */}
        <Grid size={{ xs: 6, md: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="type-filter-label">Filter by Type</InputLabel>
            <Select
              labelId="type-filter-label"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="image">Images</MenuItem>
              <MenuItem value="document">Documents</MenuItem>
              <MenuItem value="video">Videos</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Sort Field */}
        <Grid size={{ xs: 6, md: 3 }}>
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
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {sortDirection.toUpperCase()}
                </Typography>
              }
            >
              <MenuItem value="filename">Filename</MenuItem>
              <MenuItem value="size">Size</MenuItem>
              <MenuItem value="createdAt">Upload Date</MenuItem>
              <MenuItem value="updatedAt">Last Modified</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Card>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Filename
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Type
                </TableCell>
                {!isMobile && (
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Size
                  </TableCell>
                )}
                {!isMobile && (
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Uploaded
                  </TableCell>
                )}
                <TableCell
                  sx={{ color: "white", fontWeight: "bold" }}
                  align="center"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 3 : 5} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : displayedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 3 : 5} align="center">
                    {localFiltering
                      ? "No files match the filters"
                      : "No files found on this page"}
                  </TableCell>
                </TableRow>
              ) : (
                displayedRows.map((file) => (
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
                    {!isMobile && (
                      <TableCell>{formatFileSize(file.size)}</TableCell>
                    )}
                    {!isMobile && (
                      <TableCell>
                        {formatDateTime(file.createdAt)}
                      </TableCell>
                    )}
                    <TableCell align="center">
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        {/* View File Button */}
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

                        {/* Edit File Button */}
                        <Link href={`/dashboard/files/${file.id}`} passHref>
                          <IconButton size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                        </Link>

                        {/* Delete File Button (if can delete) */}
                        {canDelete && !isTrashView && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(file.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
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
          count={localFiltering ? filteredRows.length : rowCount}
          rowsPerPage={pageSize}
          page={page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this file? This action will move the
            file to the trash.
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
