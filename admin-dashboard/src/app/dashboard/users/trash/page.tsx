// /src/app/dashboard/users/trash/page.tsx

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
} from "@mui/material";
import { useDeletedUsers } from "@/lib/hooks/api/useUsers"; // Import hook for deleted users
import { usersService } from "@/lib/api/services/users.service"; // We'll use this for direct service calls
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useQueryClient } from "@tanstack/react-query";

export default function DeletedUsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading } = useDeletedUsers({ page, limit: pageSize });
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] =
    useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage + 1);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(1);
  };

  // Restore user functionality
  const handleRestoreClick = (userId: string) => {
    setSelectedUserId(userId);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (!selectedUserId) return;

    try {
      setIsProcessing(true);
      await usersService.restore(selectedUserId);
      // Invalidate queries to refresh both users and deleted users lists
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setRestoreDialogOpen(false);
      setSelectedUserId(null);
    } catch (error) {
      console.error("Error restoring user:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreCancel = () => {
    setRestoreDialogOpen(false);
    setSelectedUserId(null);
  };

  // Permanent delete functionality
  const handlePermanentDeleteClick = (userId: string) => {
    setSelectedUserId(userId);
    setPermanentDeleteDialogOpen(true);
  };

  const handlePermanentDeleteConfirm = async () => {
    if (!selectedUserId) return;

    try {
      setIsProcessing(true);
      await usersService.permanentDelete(selectedUserId);
      // Invalidate query to refresh deleted users list
      queryClient.invalidateQueries({ queryKey: ["users", "deleted"] });
      setPermanentDeleteDialogOpen(false);
      setSelectedUserId(null);
    } catch (error) {
      console.error("Error permanently deleting user:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePermanentDeleteCancel = () => {
    setPermanentDeleteDialogOpen(false);
    setSelectedUserId(null);
  };

  // Role badge color based on role
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
              Deleted Users
            </Typography>
            <Box>
              <Link href="/dashboard/users" passHref>
                <Button startIcon={<ArrowBackIcon />} variant="outlined">
                  Back to Users
                </Button>
              </Link>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                  <TableRow>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Email
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Name
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Role
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
                  ) : !data?.data || data.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No deleted users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.data.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.name || "-"}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            color={getRoleBadgeColor(user.role)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {user.deletedAt
                            ? new Date(user.deletedAt).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleRestoreClick(user.id)}
                            title="Restore user"
                          >
                            <RestoreIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handlePermanentDeleteClick(user.id)}
                            title="Permanently delete user"
                          >
                            <DeleteForeverIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
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

      {/* Restore User Dialog */}
      <Dialog open={restoreDialogOpen} onClose={handleRestoreCancel}>
        <DialogTitle>Restore User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to restore this user? The user will be moved
            back to the active users list.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRestoreCancel}>Cancel</Button>
          <Button
            onClick={handleRestoreConfirm}
            color="primary"
            autoFocus
            disabled={isProcessing}
          >
            {isProcessing ? "Restoring..." : "Restore"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permanent Delete Dialog */}
      <Dialog
        open={permanentDeleteDialogOpen}
        onClose={handlePermanentDeleteCancel}
      >
        <DialogTitle>Permanently Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this user? This action
            cannot be undone and all user data will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePermanentDeleteCancel}>Cancel</Button>
          <Button
            onClick={handlePermanentDeleteConfirm}
            color="error"
            autoFocus
            disabled={isProcessing}
          >
            {isProcessing ? "Deleting..." : "Permanently Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
