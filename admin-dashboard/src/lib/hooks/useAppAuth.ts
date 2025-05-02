import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import {
  setCredentials,
  clearCredentials,
} from "@/lib/store/slices/auth.slice";
import { useLogout, useProfile } from "@/lib/hooks/api/useAuth";
import { LoginDto } from "@/lib/types/auth";
import { useCallback, useEffect } from "react";
import { authService } from "../api/services/auth.service";
import { getErrorMessage } from "@/lib/types/error";

export function useAppAuth() {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);
  const logoutMutation = useLogout();
  const {
    data: profileData,
    isLoading,
    error: profileError,
    isError,
  } = useProfile();

  // Fix: Add a robust flag to track if we're in the middle of cleanup to prevent redirect loops
  const isAuthenticationFailed = isError && !isLoading && !!token && !user;

  // Update auth state when profile loads or errors
  useEffect(() => {
    // If there's a profileError, it means the token is invalid or expired
    if (profileError || isAuthenticationFailed) {
      // If we get a 401 error, clear credentials
      console.log(
        "Profile error or auth failed, clearing credentials:",
        profileError
      );
      // Clear token from localStorage first to ensure sync
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
      // Then clear from Redux state
      dispatch(clearCredentials());
    } else if (profileData && token) {
      // Update user data if needed
      dispatch(setCredentials({ token, user: profileData }));
    }
  }, [profileData, profileError, dispatch, token, isAuthenticationFailed]);

  // Fix: More precise logic for determining authentication state
  const isTokenPresent =
    typeof window !== "undefined"
      ? !!localStorage.getItem("accessToken")
      : !!token;
  const isAuthenticated = !!token && !!user && isTokenPresent;

  const login = useCallback(
    async (credentials: LoginDto) => {
      try {
        const response = await authService.login(credentials);
        dispatch(
          setCredentials({
            token: response.accessToken,
            user: await authService.getProfile(), // Fetch user profile after login
          })
        );
      } catch (error) {
        // Use enhanced error message extraction
        const errorMessage = getErrorMessage(error);
        console.error("Login error:", errorMessage);
        throw new Error(errorMessage);
      }
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Clear localStorage first
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
      // Then clear Redux state
      dispatch(clearCredentials());
    }
  }, [logoutMutation, dispatch]);

  return {
    isAuthenticated,
    isLoading,
    isAuthenticationFailed,
    user,
    token,
    login,
    logout,
  };
}
