// /src/app/dashboard/users/create/page.tsx

"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useCreateUser } from "@/lib/hooks/api/useUsers"; // Updated import
import { User } from "@/lib/types/user";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Grid,
  Paper,
  Stack,
  Breadcrumbs,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { ApiError } from "@/lib/types/error";

const roles = ["admin", "editor", "client"] as const;

export default function CreateUserPage() {
  const createUser = useCreateUser();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Partial<User> & { password: string }>({
    defaultValues: {
      email: "",
      name: "",
      role: "client",
      password: "",
    },
  });

  const onSubmit = async (data: Partial<User> & { password: string }) => {
    try {
      setError(null);

      // Validate data before submission
      if (!data.email?.trim()) {
        setError("Email is required");
        return;
      }

      if (!data.password?.trim() || data.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      // Create the user with properly typed object
      await createUser.mutateAsync({
        email: data.email!, // Not undefined due to validation above
        name: data.name || "",
        role: data.role || "client",
        password: data.password!, // Not undefined due to validation above
      });

      // Navigate after successful creation
      router.push("/dashboard/users");
    } catch (err) {
      console.error("Error creating user:", err);

      // Handle specific errors
      if (typeof err === "object" && err !== null) {
        const apiError = err as ApiError;
        if (apiError.message) {
          setError(apiError.message);
        } else {
          setError("Failed to create user. Please try again.");
        }
      } else {
        setError("An unknown error occurred");
      }
    }
  };

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
                href="/dashboard/users"
                passHref
                style={{ textDecoration: "none" }}
              >
                Users
              </Link>
              <Typography color="text.primary">Create User</Typography>
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
                Create New User
              </Typography>
              <Link href="/dashboard/users" passHref>
                <Button startIcon={<ArrowBackIcon />} variant="outlined">
                  Back to Users
                </Button>
              </Link>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              sx={{ mt: 1 }}
            >
              <Grid container spacing={3}>
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
                        autoFocus
                      />
                    )}
                  />
                </Grid>

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

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="password"
                    control={control}
                    rules={{
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <TextField
                        label="Password"
                        type="password"
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

                <Grid size={{ xs: 12 }}>
                  <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={isSubmitting || createUser.isPending}
                      startIcon={<SaveIcon />}
                    >
                      {isSubmitting || createUser.isPending
                        ? "Creating..."
                        : "Create User"}
                    </Button>
                    <Button
                      variant="outlined"
                      component={Link}
                      href="/dashboard/users"
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
