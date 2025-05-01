// src/app/dashboard/users/[id]/page.tsx
"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import {
  useUser,
  useUpdateUser,
  useDeleteUser,
} from "@/lib/hooks/api/useUsers";
import { User } from "@/lib/types/user";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  TextField,
  Button,
  MenuItem,
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";

const roles = ["admin", "editor", "client"] as const;

// Define proper type for error objects
interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [updateError, setUpdateError] = React.useState<string | null>(null);
  const { data: user, isLoading } = useUser(id);
  const updateUser = useUpdateUser(id);
  const deleteUser = useDeleteUser(id);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const router = useRouter();

  const { control, handleSubmit, reset } = useForm<Partial<User>>({
    defaultValues: { email: "", name: "", role: "client" },
  });

  React.useEffect(() => {
    if (user) reset(user);
  }, [user, reset]);

  const onSubmit = async (data: Partial<User>) => {
    try {
      setUpdateError(null);

      const updateData = {
        name: data.name?.trim() || undefined,
        email: data.email?.trim() || undefined,
        role: data.role || undefined,
      };

      console.log("Updating user with data:", { id, updateData });
      await updateUser.mutateAsync(updateData);

      router.push("/dashboard/users");
    } catch (error) {
      console.error("Error updating user:", error);

      let errorMessage = "Failed to update user. Please try again.";
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
      await deleteUser.mutateAsync();
      setDeleteDialogOpen(false);
      router.push("/dashboard/users");
    } catch (error) {
      console.error("Error deleting user:", error);
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

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          User not found
        </Typography>
        <Button
          component={Link}
          href="/dashboard/users"
          variant="outlined"
          sx={{ mt: 2 }}
        >
          Back to Users
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Fix: Grid must be specified correctly */}
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
                href="/dashboard/users"
                passHref
                style={{ textDecoration: "none" }}
              >
                Users
              </Link>
              <Typography color="text.primary">Edit User</Typography>
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
                Edit User: {user.name}
              </Typography>
              <Link href="/dashboard/users" passHref>
                <Button startIcon={<ArrowBackIcon />} variant="outlined">
                  Back to Users
                </Button>
              </Link>
            </Box>

            {updateError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {updateError}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              sx={{ mt: 1 }}
            >
              <Grid container spacing={3}>
                {/* Fix: Grid item specification */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <TextField
                        label="Email Address"
                        fullWidth
                        required
                        margin="normal"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        {...field}
                      />
                    )}
                  />
                </Grid>

                {/* Fix: Grid item specification */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: "Name is required" }}
                    render={({ field, fieldState }) => (
                      <TextField
                        label="Full Name"
                        fullWidth
                        required
                        margin="normal"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        {...field}
                      />
                    )}
                  />
                </Grid>

                {/* Fix: Grid item specification */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        label="User Role"
                        select
                        fullWidth
                        required
                        margin="normal"
                        {...field}
                      >
                        {roles.map((role) => (
                          <MenuItem key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>

                {/* Fix: Grid item specification */}
                <Grid size={{ xs: 12 }}>
                  <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={updateUser.isPending}
                      startIcon={<SaveIcon />}
                    >
                      {updateUser.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="outlined"
                      component={Link}
                      href="/dashboard/users"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleDelete}
                    >
                      Delete User
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user {user.name || user.email}? This
            action will move the user to trash.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            autoFocus
            disabled={deleteUser.isPending}
          >
            {deleteUser.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
