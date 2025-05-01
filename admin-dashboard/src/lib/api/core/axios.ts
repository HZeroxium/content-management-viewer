// src/lib/api/core/axios.ts
import axios from "axios";
import { store } from "@/lib/store";
import { clearCredentials } from "@/lib/store/slices/auth.slice";

// Create an Axios instance with custom configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Track if we're currently redirecting to prevent multiple redirects
let isRedirecting = false;

// Add a request interceptor to include the authentication token
api.interceptors.request.use(
  (config) => {
    // Only include the token if we're in a browser environment
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      console.log("Received 401 Unauthorized error");

      // If we're in a browser environment, clear the token
      if (typeof window !== "undefined") {
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
      }
    }

    return Promise.reject(error);
  }
);

export default api;
