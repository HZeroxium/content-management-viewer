// src/lib/hooks/api/useAuth.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/api/services/auth.service";
import {
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  UserProfile,
} from "@/lib/types/auth";

const QK = {
  profile: ["auth", "profile"],
} as const;

export const useProfile = () => {
  // Only attempt to fetch profile if there's a token
  const hasToken =
    typeof window !== "undefined" && !!localStorage.getItem("accessToken");

  return useQuery<UserProfile>({
    queryKey: QK.profile,
    queryFn: authService.getProfile,
    staleTime: 5 * 60_000, // 5 minutes instead of 30
    retry: false, // Don't retry on 401 errors
    enabled: hasToken,
    refetchOnWindowFocus: true, // Refetch when the user returns to the app
  });
};

export const useLogin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: LoginDto) => authService.login(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.profile }),
  });
};

export const useRegister = () =>
  useMutation<void, Error, RegisterDto>({
    mutationFn: (dto) => authService.register(dto),
  });

export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      qc.removeQueries(); // Clear all queries
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
    },
  });
};

export const useChangePassword = () =>
  useMutation<void, Error, ChangePasswordDto>({
    mutationFn: (dto) => authService.changePassword(dto),
  });
