import { AxiosError } from "axios";

// Define standard structure for API error responses
export interface ApiErrorData {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

// Extended error type for API errors
export interface ApiError extends Error {
  status?: number;
  data?: ApiErrorData;
  response?: {
    data?: ApiErrorData;
    status?: number;
    statusText?: string;
  };
}

/**
 * Helper function to extract a readable message from various error formats
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return "An unknown error occurred";

  if (error instanceof Error) {
    const axiosError = error as AxiosError<ApiErrorData>;

    // Check for API response with error data
    if (axiosError.response?.data?.message) {
      const message = axiosError.response.data.message;
      return Array.isArray(message) ? message.join(", ") : message;
    }

    // Check for general API error shape
    if ((error as ApiError).data?.message) {
      const message = (error as ApiError).data?.message;
      return Array.isArray(message) ? message.join(", ") : String(message);
    }

    // Regular Error message
    return axiosError.message;
  }

  // Handle error as string or unknown object
  if (typeof error === "string") return error;

  return "An unknown error occurred";
}
