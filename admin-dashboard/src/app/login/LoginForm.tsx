// src/app/login/LoginForm.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { z } from "zod";
import { useAppAuth } from "@/lib/hooks/useAppAuth"; // Updated import
import { useRouter } from "next/navigation";

// Define schema
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

// Define type from schema
type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { login, isAuthenticated, user } = useAppAuth(); // Updated hook
  const router = useRouter();
  // Use useState for success alert instead of relying on form state
  const [loginSuccess, setLoginSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect when authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      // Add delay to ensure UI is updated properly
      const redirectTimeout = setTimeout(() => {
        router.push("/dashboard");
      }, 500);
      return () => clearTimeout(redirectTimeout);
    }
  }, [isAuthenticated, user, router]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      // Set success state for the alert
      setLoginSuccess(true);
    } catch (err: unknown) {
      setLoginSuccess(false);
      const errorMessage =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "error" in err.response.data
          ? String(err.response.data.error)
          : "Login failed";

      setError("password", {
        message: errorMessage,
      });
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ maxWidth: 360, mx: "auto", mt: 8 }}
    >
      <Typography variant="h5" mb={2}>
        Admin Login
      </Typography>
      {/* Use local state instead of form state to avoid hydration issues */}
      {loginSuccess && <Alert severity="success">Logged in!</Alert>}
      <TextField
        label="Email"
        fullWidth
        margin="normal"
        {...register("email")}
        error={!!errors.email}
        helperText={errors.email?.message}
      />
      <TextField
        label="Password"
        fullWidth
        type="password"
        margin="normal"
        {...register("password")}
        error={!!errors.password}
        helperText={errors.password?.message}
      />
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={isSubmitting}
        sx={{ mt: 2 }}
      >
        {isSubmitting ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
            Logging in...
          </>
        ) : (
          "Login"
        )}
      </Button>
    </Box>
  );
}
