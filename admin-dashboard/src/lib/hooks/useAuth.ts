// src/lib/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/api/axios";
import { setUser, clearUser } from "@/lib/store/slices/auth.slice";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
import { useEffect } from "react";

export function useAuth() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.auth.user);

  // Fetch profile only when we need to
  const { data, error, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => axios.get("/auth/profile").then((res) => res.data),
    retry: false,
    // Don't automatically refetch on mount or window focus
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    // Make this query inactive if there's no user yet
    enabled: false,
  });

  // Handle success and error
  useEffect(() => {
    if (data) {
      dispatch(setUser(data));
    } else if (error) {
      dispatch(clearUser());
    }
  }, [data, error, dispatch]);

  const login = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      axios.post("/auth/login", credentials),
    onSuccess: async (response) => {
      // Most important - extract user data from login response
      if (response?.data) {
        // Save directly to Redux (no need to wait for a separate profile call)
        if (response.data.user) {
          dispatch(setUser(response.data.user));
        } else {
          // If no immediate user data, initiate the profile query
          queryClient.fetchQuery({ queryKey: ["profile"] });
        }
      }
    },
  });

  const logout = useMutation({
    mutationFn: () => axios.post("/auth/logout"),
    onSuccess: () => {
      dispatch(clearUser());
      queryClient.removeQueries();
    },
  });

  return {
    user,
    isAuthenticated: Boolean(user),
    isAuthLoading: isLoading,
    login: login.mutateAsync,
    logout: logout.mutateAsync,
  };
}
