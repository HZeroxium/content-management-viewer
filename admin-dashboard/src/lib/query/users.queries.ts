// src/lib/query/users.queries.ts
import { User } from "@/types/user";
import { PaginatedResponseDto } from "@/types/content";
import { apiClient } from "../../utils/api-client"; // Fixed path
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
export function useSaveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Partial<User>) => {
      if (user.id) {
        // For updates, remove any empty strings and undefined fields
        const { id, ...updateData } = user;
        const cleanedData = Object.fromEntries(
          Object.entries(updateData).filter(
            ([, v]) => v !== undefined && v !== ""
          )
        );
        return apiClient.patch<User>(`/users/${id}`, cleanedData);
      } else {
        // For new users, ensure required fields are present
        if (!user.password) {
          throw new Error("Password is required for new users");
        }
        return apiClient.post<User>("/users", user);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch users list and any individual user
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

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
