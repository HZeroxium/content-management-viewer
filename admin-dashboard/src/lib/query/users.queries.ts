// src/lib/query/users.queries.ts
import { User } from "@/types/user";
import { PaginatedResponseDto } from "@/types/content";
import { apiClient } from "../../utils/api-client"; // Fixed path
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";

// Define the PaginatedResponse type here to avoid circular dependencies
export type PaginatedResponse<T = User> = PaginatedResponseDto<T>;

// Get user by ID
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => apiClient.get<User>(`/users/${id}`),
    enabled: !!id,
  });
};

// Get users list with pagination
export const useUsersList = (params: { page: number; limit: number }) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () =>
      apiClient.get<PaginatedResponse<User>>(
        `/users?page=${params.page}&limit=${params.limit}`
      ),
  });
};

// Create or update user
export const useSaveUser = (
  options?: UseMutationOptions<User, Error, Partial<User> & { id?: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: Partial<User> & { id?: string }) => {
      if (user.id) {
        return apiClient.patch<User>(`/users/${user.id}`, user);
      } else {
        return apiClient.post<User>("/users", user);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    ...options,
  });
};

// Delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
