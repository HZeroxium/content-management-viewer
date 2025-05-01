// /src/contexts/auth-context.tsx

"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

// Define User type
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Update response type to match actual backend response
interface AuthResponse {
  accessToken: string;
  expiresIn?: number; // Optional as we don't actually use this
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  checkAuth: () => Promise<User | null>; // Return User or null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const saveAuthToken = (token: string) => {
    // Save token to localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);

      // Also set in a non-httpOnly cookie for easier verification
      document.cookie = `authToken=${token}; path=/; max-age=604800; samesite=strict`;
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Get token from login endpoint
      const loginResponse = await apiClient.post<AuthResponse>("/auth/login", {
        email,
        password,
      });

      console.log("Login response:", loginResponse);

      // Check if response has accessToken
      if (!loginResponse || !loginResponse.accessToken) {
        throw new Error("Invalid login response: No access token received");
      }

      // Save the auth token
      saveAuthToken(loginResponse.accessToken);

      // Now fetch the user profile with the new token
      const userProfile = await apiClient.get<User>("/auth/profile");

      if (!userProfile) {
        throw new Error("Failed to fetch user profile after login");
      }

      // Set user in state
      setUser(userProfile);

      // Add a small delay before redirect to ensure state is updated
      await new Promise((resolve) => setTimeout(resolve, 100));

      return userProfile;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear auth state
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      // Clear cookies
      document.cookie =
        "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    setUser(null);

    // Redirect to login page
    router.push("/login");
  };

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      // Check if we have a token first
      const token = localStorage.getItem("authToken");
      if (!token) {
        setUser(null);
        return null;
      }

      // Try to get the current user with the stored token
      // Fix: Change from /auth/me to /auth/profile
      const currentUser = await apiClient.get<User>("/auth/profile");

      if (!currentUser) {
        throw new Error("Failed to get user profile");
      }

      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error("Auth check failed:", error);
      // Clear invalid auth data
      localStorage.removeItem("authToken");
      document.cookie =
        "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth state on mount with browser-safe check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");

      // Only try to verify if we have a token
      if (token) {
        checkAuth();
      } else {
        // No token, so we're not authenticated
        setIsLoading(false);
      }

      // Listen for storage events (logout in other tabs)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "authToken" && !e.newValue) {
          setUser(null);
        }
      };

      window.addEventListener("storage", handleStorageChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    } else {
      // In SSR context, just mark as not loading
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
