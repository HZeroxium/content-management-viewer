// src/app/dashboard/users/UserTable.tsx

"use client";

import React, { useState, useEffect } from "react";
import { UserResponseDto as User } from "@/lib/types/user";
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
import PersonIcon from "@mui/icons-material/Person";
import { useDeleteUser } from "@/lib/hooks/api/useUsers";

interface Props {
  rows: User[];
  rowCount: number;
  page: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  canDelete?: boolean;
  isTrashView?: boolean;
}

export default function UserTable({
  rows,
  rowCount,
  page,
  pageSize,
  loading,
  onPageChange,
  onPageSizeChange,
  canDelete = true,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRows, setFilteredRows] = useState<User[]>(rows);
  const [sortField, setSortField] = useState<keyof User>("email");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [localFiltering, setLocalFiltering] = useState(false);
  const [hoverRowId, setHoverRowId] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const deleteUserMutation = useDeleteUser(userToDelete || "");

  useEffect(() => {
    const needsLocalFiltering = Boolean(searchTerm) || roleFilter !== "all";
    setLocalFiltering(needsLocalFiltering);

    if (needsLocalFiltering) {
      let result = [...rows];

      if (searchTerm) {
        result = result.filter(
          (user) =>
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.name &&
              user.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      if (roleFilter !== "all") {
        result = result.filter((user) => user.role === roleFilter);
      }

      result.sort((a, b) => {
        let valueA = a[sortField] || "";
        let valueB = b[sortField] || "";

        if (typeof valueA === "string") {
          valueA = valueA.toLowerCase();
          valueB = (valueB as string).toLowerCase();
        }

        if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
        if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });

      setFilteredRows(result);
    } else {
      setFilteredRows(rows);
    }
  }, [rows, searchTerm, roleFilter, sortField, sortDirection]);

  const displayedRows = localFiltering
    ? filteredRows.slice(0, pageSize)
    : filteredRows;

  const handleSort = (field: keyof User) => {
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

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
        await deleteUserMutation.mutateAsync();
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const getRoleBadgeColor = (
    role: string
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
    switch (role) {
      case "admin":
        return "error";
      case "editor":
        return "primary";
      case "client":
        return "success";
      default:
        return "default";
    }
  };

  // Get role description for tooltips
  const getRoleDescription = (role: string): string => {
    switch (role) {
      case "admin":
        return "Full system access with all permissions";
      case "editor":
        return "Can create and edit content";
      case "client":
        return "Has limited view-only access";
      default:
        return "Unknown role type";
    }
  };

  // Helper for skeleton loading
  const renderSkeletonRow = (index: number) => (
    <TableRow key={`skeleton-${index}`}>
      <TableCell>
        <Skeleton variant="text" animation="wave" width="80%" height={24} />
      </TableCell>
      {!isMobile && (
        <TableCell>
          <Skeleton variant="text" animation="wave" width="60%" height={24} />
        </TableCell>
      )}
      <TableCell>
        <Skeleton
          variant="rounded"
          animation="wave"
          width={80}
          height={24}
          sx={{ borderRadius: 4 }}
        />
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
        </Box>
      </TableCell>
    </TableRow>
  );

  const renderNoDataMessage = () => (
    <TableRow>
      <TableCell colSpan={isMobile ? 3 : 4} align="center" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", p: 3 }}>
          <PersonIcon
            sx={{ fontSize: 60, color: "text.secondary", opacity: 0.4, mb: 1 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {localFiltering ? "No matches found" : "No users available"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {localFiltering
              ? "Try adjusting your search or filter criteria"
              : "There are no users to display on this page"}
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
          {/* Search Field - Takes more space on mobile */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Tooltip
              title="Search users by email or name"
              arrow
              placement="top"
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by email or name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <Tooltip title="Clear search" arrow>
                        <IconButton
                          size="small"
                          onClick={() => setSearchTerm("")}
                          edge="end"
                        >
                          ×
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
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

          {/* Filter by Role */}
          <Grid size={{ xs: 6, md: 3 }}>
            <Tooltip title="Filter users by their role" arrow placement="top">
              <FormControl fullWidth>
                <InputLabel id="role-filter-label">Filter by Role</InputLabel>
                <Select
                  labelId="role-filter-label"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
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
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="editor">Editor</MenuItem>
                  <MenuItem value="client">Client</MenuItem>
                </Select>
              </FormControl>
            </Tooltip>
          </Grid>

          {/* Sort Field */}
          <Grid size={{ xs: 6, md: 3 }}>
            <Tooltip title="Sort users by column" arrow placement="top">
              <FormControl fullWidth>
                <InputLabel id="sort-field-label">Sort By</InputLabel>
                <Select
                  labelId="sort-field-label"
                  value={sortField}
                  onChange={(e) => handleSort(e.target.value as keyof User)}
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
                          ml: 1,
                          p: 0.5,
                          borderRadius: 1,
                          "&:hover": {
                            backgroundColor: "action.hover",
                          },
                        }}
                      >
                        <Typography variant="caption" fontWeight="medium">
                          {sortDirection.toUpperCase()}
                        </Typography>
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
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="role">Role</MenuItem>
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
                  whiteSpace: "nowrap",
                }}
              >
                Email
              </TableCell>
              {!isMobile && (
                <TableCell
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Name
                </TableCell>
              )}
              <TableCell
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                Role
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                Actions
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
              ? renderNoDataMessage()
              : displayedRows.map((user) => (
                  <TableRow
                    key={user.id}
                    hover
                    onMouseEnter={() => setHoverRowId(user.id)}
                    onMouseLeave={() => setHoverRowId(null)}
                    sx={{
                      backgroundColor:
                        hoverRowId === user.id
                          ? alpha(theme.palette.primary.light, 0.1)
                          : "inherit",
                      transition: "background-color 0.2s ease",
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.light,
                          0.1
                        ),
                      },
                    }}
                  >
                    <TableCell>
                      <Tooltip
                        title={`Email: ${user.email}`}
                        arrow
                        placement="top"
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight:
                              hoverRowId === user.id ? "medium" : "normal",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {user.email}
                        </Typography>
                      </Tooltip>
                    </TableCell>

                    {!isMobile && (
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight:
                              hoverRowId === user.id ? "medium" : "normal",
                            fontStyle: !user.name ? "italic" : "normal",
                            color: !user.name
                              ? "text.secondary"
                              : "text.primary",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {user.name || "Not provided"}
                        </Typography>
                      </TableCell>
                    )}

                    <TableCell>
                      <Tooltip
                        title={getRoleDescription(user.role)}
                        arrow
                        placement="top"
                      >
                        <Chip
                          label={user.role}
                          color={getRoleBadgeColor(user.role)}
                          size="small"
                          variant={
                            hoverRowId === user.id ? "filled" : "outlined"
                          }
                          sx={{
                            fontWeight: "medium",
                            transition: "all 0.2s ease",
                            minWidth: 70,
                            textAlign: "center",
                          }}
                        />
                      </Tooltip>
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <Tooltip
                          title="Edit user details"
                          arrow
                          placement="top"
                        >
                          <IconButton
                            component={Link}
                            href={`/dashboard/users/${user.id}`}
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

                        {canDelete && (
                          <Tooltip
                            title="Delete this user"
                            arrow
                            placement="top"
                          >
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(user.id)}
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
          Delete User
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action will move the
            user to the trash.
          </DialogContentText>
          {userToDelete && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: alpha(theme.palette.error.light, 0.1),
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle2" color="error.main">
                User to delete:{" "}
                {rows.find((user) => user.id === userToDelete)?.email}
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
            disabled={deleteUserMutation.isPending}
            startIcon={<DeleteIcon />}
            sx={{ borderRadius: 1 }}
          >
            {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
