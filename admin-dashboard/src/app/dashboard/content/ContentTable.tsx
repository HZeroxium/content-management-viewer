// src/app/dashboard/content/ContentTable.tsx

"use client";

import React, { useState, useEffect } from "react";
import { ContentResponseDto } from "@/lib/types/content";
import {
  Box,
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
  Skeleton,
  Paper,
  Chip,
  Fade,
  alpha,
  Divider,
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
import ClearIcon from "@mui/icons-material/Clear";
import DescriptionIcon from "@mui/icons-material/Description";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {
  useDeleteContent,
  useRestoreContent,
  usePermanentDeleteContent,
} from "@/lib/hooks/api/useContents";

import { formatDate, formatDateTime } from "@/utils/format";

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
  onRestoreClick?: (id: string) => void;
  onPermanentDeleteClick?: (id: string) => void;
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
  onRestoreClick,
  onPermanentDeleteClick,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRows, setFilteredRows] = useState<ContentResponseDto[]>(rows);
  const [sortField, setSortField] = useState<keyof ContentResponseDto>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [localFiltering, setLocalFiltering] = useState(false);
  const [hoverRowId, setHoverRowId] = useState<string | null>(null);

  // Action dialogs state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] =
    useState(false);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(
    null
  );
  const [selectedContentTitle, setSelectedContentTitle] = useState<string>("");

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

  const handleDeleteClick = (contentId: string, title: string) => {
    setSelectedContentId(contentId);
    setSelectedContentTitle(title);
    setDeleteDialogOpen(true);
  };

  const handleRestoreClick = (contentId: string, title: string) => {
    setSelectedContentId(contentId);
    setSelectedContentTitle(title);
    setRestoreDialogOpen(true);
  };

  const handlePermanentDeleteClick = (contentId: string, title: string) => {
    setSelectedContentId(contentId);
    setSelectedContentTitle(title);
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
        // Call the optional callback
        onRestoreClick?.(selectedContentId);
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
        // Call the optional callback
        onPermanentDeleteClick?.(selectedContentId);
      } catch (error) {
        console.error("Error permanently deleting content:", error);
      }
    }
  };

  // Render a skeleton loading row
  const renderSkeletonRow = (index: number) => (
    <TableRow key={`skeleton-${index}`}>
      <TableCell>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Skeleton variant="text" animation="wave" width="70%" height={24} />
          <Skeleton variant="text" animation="wave" width="40%" height={16} />
        </Box>
      </TableCell>

      {!isMobile && (
        <TableCell>
          <Skeleton variant="rounded" animation="wave" width={60} height={24} />
        </TableCell>
      )}

      {!isMobile && (
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Skeleton
              variant="circular"
              animation="wave"
              width={16}
              height={16}
            />
            <Skeleton variant="text" animation="wave" width={80} height={20} />
          </Box>
        </TableCell>
      )}

      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Skeleton
            variant="circular"
            animation="wave"
            width={16}
            height={16}
          />
          <Skeleton variant="text" animation="wave" width={80} height={20} />
        </Box>
      </TableCell>

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
          {!isTrashView && (
            <Skeleton
              variant="circular"
              animation="wave"
              width={30}
              height={30}
              sx={{ mx: 0.5 }}
            />
          )}
        </Box>
      </TableCell>
    </TableRow>
  );

  // Render empty state message
  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={isMobile ? 3 : 5} align="center" sx={{ py: 6 }}>
        <Box sx={{ textAlign: "center" }}>
          <DescriptionIcon
            sx={{ fontSize: 60, color: "text.secondary", opacity: 0.4, mb: 1 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {localFiltering ? "No matching content" : "No content found"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {localFiltering
              ? "Try adjusting your search criteria"
              : isTrashView
              ? "There are no deleted items in the trash"
              : "Create new content to get started"}
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
        <Grid container spacing={2} alignItems="center">
          {/* Search Field */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Tooltip title="Search by title or description" arrow>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by title or description..."
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
                    borderRadius: 1.5,
                    "&.Mui-focused": {
                      boxShadow: `0 0 0 2px ${alpha(
                        theme.palette.primary.main,
                        0.25
                      )}`,
                    },
                  },
                }}
                sx={{ bgcolor: "background.paper" }}
              />
            </Tooltip>
          </Grid>

          {/* Sort Field */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Tooltip title="Sort content items" arrow>
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
                    <Tooltip
                      title={`Click to change to ${
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
                    borderRadius: 1.5,
                    "&.Mui-focused": {
                      boxShadow: `0 0 0 2px ${alpha(
                        theme.palette.primary.main,
                        0.25
                      )}`,
                    },
                  }}
                >
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="createdAt">Created Date</MenuItem>
                  <MenuItem value="updatedAt">Updated Date</MenuItem>
                </Select>
              </FormControl>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>

      <Divider />

      {/* Main Table */}
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
                <Tooltip title="Content title and description" arrow>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <DescriptionIcon
                      fontSize="small"
                      sx={{ mr: 0.5, opacity: 0.7 }}
                    />
                    Title
                  </Box>
                </Tooltip>
              </TableCell>

              {!isMobile && (
                <TableCell
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: "white",
                    fontWeight: "bold",
                    width: 100,
                  }}
                >
                  <Tooltip title="Number of content blocks" arrow>
                    <span>Blocks</span>
                  </Tooltip>
                </TableCell>
              )}

              {!isMobile && (
                <TableCell
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: "white",
                    fontWeight: "bold",
                    width: 130,
                  }}
                >
                  <Tooltip title="Creation date" arrow>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CalendarTodayIcon
                        fontSize="small"
                        sx={{ mr: 0.5, opacity: 0.7 }}
                      />
                      Created
                    </Box>
                  </Tooltip>
                </TableCell>
              )}

              <TableCell
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: "white",
                  fontWeight: "bold",
                  width: 130,
                }}
              >
                <Tooltip title="Last update date" arrow>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <AccessTimeIcon
                      fontSize="small"
                      sx={{ mr: 0.5, opacity: 0.7 }}
                    />
                    Updated
                  </Box>
                </Tooltip>
              </TableCell>

              <TableCell
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: "white",
                  fontWeight: "bold",
                  width: 140,
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
              : displayedRows.map((content) => (
                  <TableRow
                    key={content.id}
                    hover
                    onMouseEnter={() => setHoverRowId(content.id)}
                    onMouseLeave={() => setHoverRowId(null)}
                    sx={{
                      backgroundColor:
                        hoverRowId === content.id
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
                    <TableCell sx={{ verticalAlign: "top", py: 1.5 }}>
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        sx={{
                          color:
                            hoverRowId === content.id
                              ? theme.palette.primary.main
                              : "text.primary",
                          transition: "color 0.2s",
                        }}
                      >
                        {content.title}
                      </Typography>

                      {content.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
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
                        <Tooltip
                          title={`${
                            content.blocks?.length || 0
                          } content blocks`}
                          arrow
                        >
                          <Chip
                            label={`${content.blocks?.length || 0}`}
                            size="small"
                            color={
                              hoverRowId === content.id ? "primary" : "default"
                            }
                            variant={
                              hoverRowId === content.id ? "filled" : "outlined"
                            }
                            sx={{
                              minWidth: 40,
                              fontWeight: "medium",
                              transition: "all 0.2s ease",
                            }}
                          />
                        </Tooltip>
                      </TableCell>
                    )}

                    {!isMobile && (
                      <TableCell>
                        <Tooltip
                          title={formatDateTime(content.createdAt || "")}
                          arrow
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <CalendarTodayIcon
                              fontSize="small"
                              color={
                                hoverRowId === content.id ? "primary" : "action"
                              }
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "medium",
                                color:
                                  hoverRowId === content.id
                                    ? "primary.main"
                                    : "text.secondary",
                                transition: "color 0.2s",
                              }}
                            >
                              {formatDate(content.createdAt || "")}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                    )}

                    <TableCell>
                      <Tooltip
                        title={formatDateTime(content.updatedAt || "")}
                        arrow
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <AccessTimeIcon
                            fontSize="small"
                            color={
                              hoverRowId === content.id ? "primary" : "action"
                            }
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: "medium",
                              color:
                                hoverRowId === content.id
                                  ? "primary.main"
                                  : "text.secondary",
                              transition: "color 0.2s",
                            }}
                          >
                            {formatDate(content.updatedAt || "")}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>

                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          opacity: hoverRowId === content.id ? 1 : 0.85,
                          transition: "opacity 0.2s ease",
                        }}
                      >
                        <Tooltip title="Preview content" arrow>
                          <IconButton
                            component={Link}
                            href={`/dashboard/content/preview/${content.id}`}
                            size="small"
                            color="info"
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

                        {!isTrashView && (
                          <Tooltip title="Edit content" arrow>
                            <IconButton
                              component={Link}
                              href={`/dashboard/content/${content.id}`}
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
                        )}

                        {isTrashView ? (
                          <>
                            <Tooltip title="Restore content" arrow>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() =>
                                  handleRestoreClick(content.id, content.title)
                                }
                                sx={{
                                  mx: 0.5,
                                  transition:
                                    "transform 0.2s ease, background-color 0.2s ease",
                                  "&:hover": {
                                    transform: "scale(1.1)",
                                    backgroundColor: alpha(
                                      theme.palette.success.main,
                                      0.1
                                    ),
                                  },
                                }}
                              >
                                <RestoreIcon
                                  fontSize={isTablet ? "small" : "medium"}
                                />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete permanently" arrow>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  handlePermanentDeleteClick(
                                    content.id,
                                    content.title
                                  )
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
                                <DeleteForeverIcon
                                  fontSize={isTablet ? "small" : "medium"}
                                />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          canDelete && (
                            <Tooltip title="Move to trash" arrow>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  handleDeleteClick(content.id, content.title)
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
                          )
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

      {/* Action Dialogs */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        TransitionComponent={Fade}
        transitionDuration={300}
        PaperProps={{
          elevation: 8,
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ fontWeight: "medium", pb: 1 }}>
          Delete Content
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this content? This action will move
            the content to trash.
          </DialogContentText>

          {selectedContentTitle && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: alpha(theme.palette.error.light, 0.1),
                borderRadius: 1,
              }}
            >
              {" "}
              <Typography variant="subtitle2" color="error.main">
                Content to delete: &ldquo;{selectedContentTitle}&rdquo;
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
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
            disabled={deleteContentMutation.isPending}
            startIcon={<DeleteIcon />}
            sx={{ borderRadius: 1 }}
          >
            {deleteContentMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={restoreDialogOpen}
        onClose={() => setRestoreDialogOpen(false)}
        TransitionComponent={Fade}
        transitionDuration={300}
        PaperProps={{
          elevation: 8,
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ fontWeight: "medium", pb: 1 }}>
          Restore Content
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to restore this content? It will be visible
            again in the main content list.
          </DialogContentText>

          {selectedContentTitle && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: alpha(theme.palette.success.light, 0.1),
                borderRadius: 1,
              }}
            >
              {" "}
              <Typography variant="subtitle2" color="success.main">
                Content to restore: &ldquo;{selectedContentTitle}&rdquo;
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setRestoreDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRestoreConfirm}
            color="success"
            variant="contained"
            autoFocus
            disabled={restoreContentMutation.isPending}
            startIcon={<RestoreIcon />}
            sx={{ borderRadius: 1 }}
          >
            {restoreContentMutation.isPending ? "Restoring..." : "Restore"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={permanentDeleteDialogOpen}
        onClose={() => setPermanentDeleteDialogOpen(false)}
        TransitionComponent={Fade}
        transitionDuration={300}
        PaperProps={{
          elevation: 8,
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "medium",
            pb: 1,
            color: theme.palette.error.dark,
          }}
        >
          Permanently Delete Content
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <b>Warning:</b> Are you sure you want to permanently delete this
            content? This action cannot be undone.
          </DialogContentText>

          {selectedContentTitle && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
              }}
            >
              {" "}
              <Typography
                variant="subtitle2"
                color="error.main"
                fontWeight="medium"
              >
                Content to permanently delete: &ldquo;{selectedContentTitle}
                &rdquo;
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setPermanentDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePermanentDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
            disabled={permanentDeleteContentMutation.isPending}
            startIcon={<DeleteForeverIcon />}
            sx={{ borderRadius: 1 }}
          >
            {permanentDeleteContentMutation.isPending
              ? "Deleting..."
              : "Delete Permanently"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
