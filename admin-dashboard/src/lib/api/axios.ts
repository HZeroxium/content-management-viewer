// src/lib/api/axios.ts
import axios from "axios";
import { store } from "@/lib/store";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // send httpOnly cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a response interceptor for auth handling
instance.interceptors.response.use(
  (response) => {
    // Check if response has an auth token and store it if needed
    // (Only needed if your backend doesn't use httpOnly cookies)
    if (response.data?.accessToken) {
      localStorage.setItem("auth_token", response.data.accessToken);
    }
    return response;
  },
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      // Clear user data on 401 (unauthorized)
      if (store) {
        // Don't redirect here - let components handle navigation
        // Just clear the auth state
      }
    }
    return Promise.reject(error);
  }
);

// Add token to requests if available
instance.interceptors.request.use(
  (config) => {
    // Only for browser environment
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
