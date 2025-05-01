// src/app/dashboard/users/UserTable.tsx

"use client";

import React, { useState, useEffect } from "react";
import { UserResponseDto as User } from "@/lib/types/user";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRows, setFilteredRows] = useState<User[]>(rows);
  const [sortField, setSortField] = useState<keyof User>("email");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [localFiltering, setLocalFiltering] = useState(false);

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

  return (
    <Box sx={{ width: "100%" }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Search Field - Takes more space on mobile */}
        <Grid size={{ xs: 12, md: 6 }}>
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
            }}
          />
        </Grid>

        {/* Filter by Role */}
        <Grid size={{ xs: 6, md: 3 }}>
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
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="editor">Editor</MenuItem>
              <MenuItem value="client">Client</MenuItem>
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
              onChange={(e) => handleSort(e.target.value as keyof User)}
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
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="role">Role</MenuItem>
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
                  Email
                </TableCell>
                {!isMobile && (
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Name
                  </TableCell>
                )}
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Role
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
                  <TableCell colSpan={isMobile ? 3 : 4} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : displayedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 3 : 4} align="center">
                    {localFiltering
                      ? "No users match the filters"
                      : "No users found on this page"}
                  </TableCell>
                </TableRow>
              ) : (
                displayedRows.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.email}</TableCell>
                    {!isMobile && <TableCell>{user.name || "-"}</TableCell>}
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={getRoleBadgeColor(user.role)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <Link href={`/dashboard/users/${user.id}`} passHref>
                          <IconButton size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                        </Link>

                        {canDelete && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(user.id)}
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

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action will move the
            user to the trash.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            autoFocus
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
