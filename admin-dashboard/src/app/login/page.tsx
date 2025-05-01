// /src/app/login/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loginProcessing, setLoginProcessing] = useState(false);
  const { login, isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Effect to handle successful authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("User authenticated, redirecting to dashboard", user);
      // Use replace instead of push to avoid back button issues
      router.replace("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError("");
      setLoginProcessing(true);

      console.log("Starting login process for:", data.email);

      // Try to log in
      const user = await login(data.email, data.password);
      console.log("Login successful, user:", user);

      // If login succeeds but doesn't redirect (handled by the effect above),
      // we'll explicitly redirect here after a short delay
      setTimeout(() => {
        if (document.location.pathname === "/login") {
          console.log("Manual redirect to dashboard after login");
          router.replace("/dashboard");
        }
      }, 500);
    } catch (err) {
      console.error("Login error in component:", err);
      let errorMessage = "Invalid email or password. Please try again.";

      // Try to extract more specific error message
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null) {
        interface ErrorWithData {
          data?: { message?: string };
          message?: string;
        }
        const errorObj = err as ErrorWithData;
        if (errorObj.data?.message) {
          errorMessage = errorObj.data.message;
        } else if (errorObj.message) {
          errorMessage = errorObj.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoginProcessing(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  // If already authenticated, redirect to dashboard
  if (isAuthenticated && user) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography>Already logged in. Redirecting...</Typography>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          mt: 8,
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ mt: 1, width: "100%" }}
        >
          <TextField
            margin="normal"
            fullWidth
            id="email"
            label="Email Address"
            autoComplete="email"
            autoFocus
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />
          <TextField
            margin="normal"
            fullWidth
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loginProcessing}
            startIcon={
              loginProcessing ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
          >
            {loginProcessing ? "Signing in..." : "Sign In"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
