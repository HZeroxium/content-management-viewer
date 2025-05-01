// src/lib/query/content.queries.ts
import { Content, PaginatedContent } from "@/types/content";
import { apiClient } from "../../utils/api-client"; // Fixed path
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";

// Fetch content list with pagination
export const useContentList = (params: { page: number; limit: number }) => {
  return useQuery({
    queryKey: ["content", params],
    queryFn: () =>
      apiClient.get<PaginatedContent>(
        `/content?page=${params.page}&limit=${params.limit}`
      ),
  });
};

// Fetch single content by ID
export const useContent = (id: string) => {
  return useQuery({
    queryKey: ["content", id],
    queryFn: () => apiClient.get<Content>(`/content/${id}`),
    enabled: !!id,
  });
};

// Create/update content
export const useSaveContent = (
  options?: UseMutationOptions<Content, Error, Content>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentData: Content) => {
      if (contentData.id) {
        // Update existing - should use PATCH not POST
        return apiClient.patch<Content>(
          `/content/${contentData.id}`,
          contentData
        );
      } else {
        // Create new
        return apiClient.post<Content>("/content", contentData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
    },
    ...options,
  });
};

// Delete content
export const useDeleteContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/content/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
    },
  });
};
