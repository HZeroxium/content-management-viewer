// /src/components/ErrorDisplay.tsx

import React from "react";
import { Alert, AlertTitle, Box, Typography } from "@mui/material";
import { getErrorMessage } from "@/lib/types/error";

// Define more specific types to replace any
type ErrorWithResponse = Error & {
  response?: {
    data?: Record<string, unknown>;
    status?: number;
  };
};

type DetailedError = Error & {
  detail?: Record<string, unknown>;
};

interface ErrorDisplayProps {
  error: unknown;
  title?: string;
  severity?: "error" | "warning" | "info" | "success";
  showDetails?: boolean;
  onRetry?: () => void;
}

// Format error for logging with specific types
export function formatErrorForLogging(error: unknown): Record<string, unknown> {
  if (!error) return { message: "Unknown error" };

  // For axios errors with response data
  if (error instanceof Error) {
    const errorWithResponse = error as ErrorWithResponse;

    if (errorWithResponse.response?.data) {
      return {
        message: errorWithResponse.message,
        response: errorWithResponse.response.data,
        status: errorWithResponse.response.status,
      };
    }

    // For standard errors with details
    const detailedError = error as DetailedError;
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(detailedError.detail && { detail: detailedError.detail }),
    };
  }

  // For unknown error types
  return { rawError: error };
}

export default function ErrorDisplay({
  error,
  title = "Error",
}: ErrorDisplayProps) {
  if (!error) return null;

  const errorMessage = getErrorMessage(error);

  // Fix: Initialize with proper type and handle undefined values
  let detailedInfo: Record<string, unknown> = {};

  if (error instanceof Error && (error as DetailedError).detail) {
    // Ensure we don't assign undefined to detailedInfo
    const detail = (error as DetailedError).detail;
    if (detail) {
      detailedInfo = detail;
    }
  } else if (
    error instanceof Error &&
    (error as ErrorWithResponse).response?.data
  ) {
    // Use optional chaining and nullish coalescing to handle undefined
    const responseData = (error as ErrorWithResponse).response?.data;
    if (responseData) {
      detailedInfo = responseData;
    }
  }

  return (
    <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
      <AlertTitle>{title}</AlertTitle>
      <Typography variant="body2">{errorMessage}</Typography>

      {/* Show additional details in development mode */}
      {process.env.NODE_ENV === "development" &&
        Object.keys(detailedInfo).length > 0 && (
          <Box mt={1} p={1} bgcolor="rgba(0,0,0,0.03)" borderRadius={1}>
            <Typography
              variant="caption"
              component="pre"
              sx={{ whiteSpace: "pre-wrap" }}
            >
              {JSON.stringify(detailedInfo, null, 2)}
            </Typography>
          </Box>
        )}
    </Alert>
  );
}
