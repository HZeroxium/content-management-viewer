// src/lib/api/core/axios.ts
import axios from "axios";
import { store } from "../../store/store";
import { clearCredentials } from "../../store/slices/auth.slice";
import { ApiErrorData, formatErrorForLogging } from "../../types/error";

// Base API instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple redirects
let isRedirecting = false;

// Add request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    // Only run in browser environment
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🟢 API Success [${response.config.method}] ${response.config.url}`,
        {
          status: response.status,
          data: response.data,
        }
      );
    }
    return response;
  },
  (error) => {
    // Enhanced error handling with detailed logging
    console.group(
      `🔴 API Error [${error.config?.method || "unknown"}] ${
        error.config?.url || "unknown"
      }`
    );

    // Extract error data from response
    const errorData: Partial<ApiErrorData> = {
      statusCode: error.response?.status,
      path: error.config?.url,
      error: error.response?.data?.error || error.message,
      timestamp: new Date().toISOString(),
    };

    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      console.log("Unauthorized access detected");

      // If we're in a browser environment, clear the token
      if (typeof window !== "undefined") {
        // Don't log out on login page errors
        if (!window.location.pathname.includes("/login")) {
          // Clear token from localStorage
          localStorage.removeItem("accessToken");

          // Also clear from Redux store to keep state in sync
          store.dispatch(clearCredentials());

          // Don't redirect if we're already on the login page or already redirecting
          if (!window.location.pathname.includes("/login") && !isRedirecting) {
            console.log("Redirecting to login page due to 401 error");
            isRedirecting = true;

            // Use a slight delay to allow other code to complete
            setTimeout(() => {
              window.location.href = "/login";
              isRedirecting = false;
            }, 100);
          }
        } else {
          console.log("Login error - not redirecting from login page");
        }
      }
    }

    // Enhanced error handling - format the error before returning
    const originalError = error;

    // Extract detailed error message if available in response
    if (error.response?.data) {
      // Combine our response data with original response data
      Object.assign(errorData, error.response.data);

      // Preserve the original error but enhance it with better details
      error.message =
        error.response.data.error ||
        (Array.isArray(error.response.data.message)
          ? error.response.data.message.join(", ")
          : error.response.data.message) ||
        error.message;

      // Add detailed error information from backend
      error.detail = errorData;

      // Store original error for reference
      error.originalError = originalError;
    }

    // Log detailed error information for debugging
    console.error("Error details:", formatErrorForLogging(error));
    console.groupEnd();

    return Promise.reject(error);
  }
);

export default api;
