// /src/app/login/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAppAuth } from "@/lib/hooks/useAppAuth";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useErrorHandler } from "@/lib/hooks/useErrorHandler";
import ErrorDisplay from "@/components/common/ErrorDisplay";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { error, handleError, clearError } = useErrorHandler();
  const [loginProcessing, setLoginProcessing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { login, isAuthenticated, user, isLoading } = useAppAuth();
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
    // Only redirect if we're not already redirecting, not loading, and authenticated with a user
    if (isAuthenticated && user && !isRedirecting && !isLoading) {
      console.log(
        "User authenticated in login page, redirecting to dashboard",
        user
      );
      setIsRedirecting(true);

      // Use setTimeout to avoid potential redirect loops and give state time to update
      setTimeout(() => {
        router.replace("/dashboard");
      }, 100);
    }
  }, [isAuthenticated, user, router, isLoading, isRedirecting]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      setLoginProcessing(true);

      console.log("Starting login process for:", data.email);

      await login({
        email: data.email,
        password: data.password,
      });

      // Login handled by the effect above - no need for additional redirect here
    } catch (err) {
      handleError(err);
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

  // If already authenticated, show a message while redirecting happens via the effect
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
        {" "}
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        {error ? <ErrorDisplay error={error} /> : null}
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
