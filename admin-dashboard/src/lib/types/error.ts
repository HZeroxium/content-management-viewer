// /src/lib/types/error.ts

import { AxiosError } from "axios";

/**
 * Defines the expected structure of error responses from the backend API
 * Based on NestJS HttpExceptionFilter format
 */
export interface ApiErrorData {
  // Core error fields from backend
  statusCode: number;
  timestamp: string;
  path: string;
  error: string | string[]; // Error can be string or array of validation errors

  // Sometimes the backend might include a message field instead of error
  message?: string | string[];
}

/**
 * Extended error type for API errors to support both axios and custom errors
 */
export interface ApiError extends Error {
  // Standard HTTP status
  status?: number;

  // Custom error details we add in our axios interceptors
  detail?: ApiErrorData;

  // Axios specific error response properties
  response?: {
    data?: ApiErrorData;
    status?: number;
    statusText?: string;
  };

  // Sometimes errors contain direct data property
  data?: ApiErrorData;

  // Original error before any transformations
  originalError?: unknown;
}

/**
 * Formats an error for console logging with proper structure
 */
export function formatErrorForLogging(error: unknown): Record<string, unknown> {
  if (!error) return { message: "Unknown error" };

  // For axios errors with response data
  if (
    error instanceof Error &&
    (error as AxiosError<ApiErrorData>).response?.data
  ) {
    const axiosError = error as AxiosError<ApiErrorData>;
    return {
      message: axiosError.message,
      response: axiosError.response?.data,
      status: axiosError.response?.status,
    };
  }

  // For standard errors
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...((error as ApiError).detail && { detail: (error as ApiError).detail }),
    };
  }

  // For unknown error types
  return { rawError: error };
}

/**
 * Helper function to extract a readable message from various error formats
 * Handles all possible error structures from the backend
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return "An unknown error occurred";

  // For system development
  console.group("📌 Error Details");
  console.log("Original error:", error);
  console.log("Formatted:", formatErrorForLogging(error));
  console.groupEnd();

  // Handle ApiError / AxiosError
  if (error instanceof Error) {
    const axiosError = error as AxiosError<ApiErrorData>;

    // Case 1: Try error.detail?.error (set by our axios interceptor)
    if ((error as ApiError).detail?.error) {
      const detailError = (error as ApiError).detail?.error; // Add null check
      if (detailError && Array.isArray(detailError)) {
        return detailError.join("\n• ");
      }
      return detailError || "Unknown error";
    }

    // Case 2: Try axios response.data.error
    if (axiosError.response?.data?.error) {
      const responseError = axiosError.response.data.error;
      if (Array.isArray(responseError)) {
        return "• " + responseError.join("\n• ");
      }
      return responseError;
    }

    // Case 3: Try axios response.data.message
    if (axiosError.response?.data?.message) {
      const message = axiosError.response.data.message;
      if (Array.isArray(message)) {
        return message.join(", ");
      }
      return message.toString();
    }

    // Case 4: Try error.data?.message
    if ((error as ApiError).data?.message) {
      const message = (error as ApiError).data?.message;
      if (Array.isArray(message)) {
        return message.join(", ");
      }
      return String(message);
    }

    // Default: Use the normal error message
    return axiosError.message;
  }

  // Handle direct string errors
  if (typeof error === "string") return error;

  // Handle unknown error formats
  if (typeof error === "object" && error !== null) {
    return JSON.stringify(error);
  }

  return "An unknown error occurred";
}

/**
 * Checks if the error is specifically an unauthorized error (401)
 */
export function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof Error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 401;
  }
  return false;
}

/**
 * Checks if the error is a validation error (typically 400 with array of errors)
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof Error) {
    const axiosError = error as AxiosError<ApiErrorData>;
    return (
      axiosError.response?.status === 400 &&
      Array.isArray(axiosError.response?.data?.error)
    );
  }
  return false;
}
