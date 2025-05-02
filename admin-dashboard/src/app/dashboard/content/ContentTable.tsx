// src/app/dashboard/content/ContentTable.tsx

"use client";

import React, { useState, useEffect } from "react";
import { ContentResponseDto } from "@/lib/types/content";
import {
  Box,
  Card,
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
  IconButton,
  useTheme,
  useMediaQuery,
  Tooltip,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import Link from "next/link";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import {
  useDeleteContent,
  useRestoreContent,
  usePermanentDeleteContent,
} from "@/lib/hooks/api/useContents";

interface Props {
  rows: ContentResponseDto[];
  rowCount: number;
  page: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  canDelete?: boolean;
  isTrashView?: boolean;
}

export default function ContentTable({
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
  const [filteredRows, setFilteredRows] = useState<ContentResponseDto[]>(rows);
  const [sortField, setSortField] = useState<keyof ContentResponseDto>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [localFiltering, setLocalFiltering] = useState(false);

  // Action dialogs state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] =
    useState(false);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(
    null
  );

  // Mutations
  const deleteContentMutation = useDeleteContent(selectedContentId || "");
  const restoreContentMutation = useRestoreContent(selectedContentId || "");
  const permanentDeleteContentMutation = usePermanentDeleteContent(
    selectedContentId || ""
  );

  // Update filtered rows whenever props or filters change
  useEffect(() => {
    // Check if we need local filtering
    const needsLocalFiltering = searchTerm !== "";
    setLocalFiltering(needsLocalFiltering);

    let result = [...rows];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (content) =>
          content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (content.description &&
            content.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA = a[sortField];
      let valueB = b[sortField];

      // Handle dates
      if (sortField === "createdAt" || sortField === "updatedAt") {
        return sortDirection === "asc"
          ? new Date(valueA as string).getTime() -
              new Date(valueB as string).getTime()
          : new Date(valueB as string).getTime() -
              new Date(valueA as string).getTime();
      }

      // Handle strings
      if (typeof valueA === "string" && typeof valueB === "string") {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
        if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
        if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      }

      return 0;
    });

    setFilteredRows(result);
  }, [rows, searchTerm, sortField, sortDirection]);

  // We only do local pagination if we're also doing local filtering
  const displayedRows = localFiltering
    ? filteredRows.slice(0, pageSize)
    : filteredRows;

  // Handlers
  const handleSort = (field: keyof ContentResponseDto) => {
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

  const handleDeleteClick = (contentId: string) => {
    setSelectedContentId(contentId);
    setDeleteDialogOpen(true);
  };

  const handleRestoreClick = (contentId: string) => {
    setSelectedContentId(contentId);
    setRestoreDialogOpen(true);
  };

  const handlePermanentDeleteClick = (contentId: string) => {
    setSelectedContentId(contentId);
    setPermanentDeleteDialogOpen(true);
  };

  // Action handlers
  const handleDeleteConfirm = async () => {
    if (selectedContentId) {
      try {
        await deleteContentMutation.mutateAsync();
        setDeleteDialogOpen(false);
        setSelectedContentId(null);
      } catch (error) {
        console.error("Error deleting content:", error);
      }
    }
  };

  const handleRestoreConfirm = async () => {
    if (selectedContentId) {
      try {
        await restoreContentMutation.mutateAsync();
        setRestoreDialogOpen(false);
        setSelectedContentId(null);
      } catch (error) {
        console.error("Error restoring content:", error);
      }
    }
  };

  const handlePermanentDeleteConfirm = async () => {
    if (selectedContentId) {
      try {
        await permanentDeleteContentMutation.mutateAsync();
        setPermanentDeleteDialogOpen(false);
        setSelectedContentId(null);
      } catch (error) {
        console.error("Error permanently deleting content:", error);
      }
    }
  };

  // Format dates for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Search Field */}
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by title or description"
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

        {/* Sort Field */}
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth>
            <InputLabel id="sort-field-label">Sort By</InputLabel>
            <Select
              labelId="sort-field-label"
              value={sortField}
              onChange={(e) =>
                handleSort(e.target.value as keyof ContentResponseDto)
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
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="createdAt">Created Date</MenuItem>
              <MenuItem value="updatedAt">Updated Date</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Main Table */}
      <Card>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Title
                </TableCell>
                {!isMobile && (
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Blocks
                  </TableCell>
                )}
                {!isMobile && (
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Created
                  </TableCell>
                )}
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Updated
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
                      ? "No content matches the filters"
                      : "No content found on this page"}
                  </TableCell>
                </TableRow>
              ) : (
                displayedRows.map((content) => (
                  <TableRow key={content.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {content.title}
                      </Typography>
                      {content.description && (
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{
                            display: "block",
                            mt: 0.5,
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            maxWidth: "300px",
                          }}
                        >
                          {content.description}
                        </Typography>
                      )}
                    </TableCell>

                    {!isMobile && (
                      <TableCell>
                        <Typography variant="body2">
                          {content.blocks?.length || 0} blocks
                        </Typography>
                      </TableCell>
                    )}

                    {!isMobile && (
                      <TableCell>
                        <Tooltip
                          title={new Date(content.createdAt).toLocaleString()}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <CalendarTodayIcon fontSize="small" />
                            {formatDate(content.createdAt)}
                          </Box>
                        </Tooltip>
                      </TableCell>
                    )}

                    <TableCell>
                      <Tooltip
                        title={new Date(content.updatedAt).toLocaleString()}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CalendarTodayIcon fontSize="small" />
                          {formatDate(content.updatedAt)}
                        </Box>
                      </Tooltip>
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <Link
                          href={`/dashboard/content/preview/${content.id}`}
                          passHref
                        >
                          <IconButton size="small" color="info">
                            <VisibilityIcon />
                          </IconButton>
                        </Link>

                        {!isTrashView && (
                          <Link
                            href={`/dashboard/content/${content.id}`}
                            passHref
                          >
                            <IconButton size="small" color="primary">
                              <EditIcon />
                            </IconButton>
                          </Link>
                        )}

                        {isTrashView ? (
                          <>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleRestoreClick(content.id)}
                            >
                              <RestoreIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                handlePermanentDeleteClick(content.id)
                              }
                            >
                              <DeleteForeverIcon />
                            </IconButton>
                          </>
                        ) : (
                          canDelete && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(content.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )
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

      {/* Action Dialogs */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Content</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this content? This action will move
            the content to trash.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            autoFocus
            disabled={deleteContentMutation.isPending}
          >
            {deleteContentMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={restoreDialogOpen}
        onClose={() => setRestoreDialogOpen(false)}
      >
        <DialogTitle>Restore Content</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to restore this content? It will be visible
            again in the main content list.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRestoreConfirm}
            color="primary"
            autoFocus
            disabled={restoreContentMutation.isPending}
          >
            {restoreContentMutation.isPending ? "Restoring..." : "Restore"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={permanentDeleteDialogOpen}
        onClose={() => setPermanentDeleteDialogOpen(false)}
      >
        <DialogTitle>Permanently Delete Content</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this content? This
            action cannot be undone.
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
            disabled={permanentDeleteContentMutation.isPending}
          >
            {permanentDeleteContentMutation.isPending
              ? "Deleting..."
              : "Delete Permanently"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
