// src/lib/hooks/api/useContents.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { contentService } from "@/lib/api/services/content.service";
import {
  CreateContentWithBlocksDto,
  UpdateContentDto,
} from "@/lib/types/content";
import { PaginationQuery } from "@/lib/types/base";
import { socketService } from "@/lib/services/socket.service";
import { useEffect, useMemo } from "react";

// Query keys for React Query
const QK = {
  list: (p: PaginationQuery | undefined) => ["contents", p],
  deleted: (p: PaginationQuery | undefined) => ["contents", "deleted", p],
  detail: (id: string) => ["content", id],
};

export const useContents = (params?: PaginationQuery) =>
  useQuery({
    queryKey: QK.list(params),
    queryFn: () => contentService.fetchAll(params || { page: 1, limit: 10 }),
    enabled: !!params,
    placeholderData: keepPreviousData,
  });

export const useDeletedContents = (params?: PaginationQuery) =>
  useQuery({
    queryKey: QK.deleted(params),
    queryFn: () =>
      contentService.fetchDeleted(params || { page: 1, limit: 10 }),
    enabled: !!params,
    placeholderData: keepPreviousData,
  });

export function useContent(id: string) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["content", id], [id]);

  const query = useQuery({
    queryKey,
    queryFn: () => contentService.fetchById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Subscribe to real-time updates for this specific content
  useEffect(() => {
    if (!id) return;

    const unsubscribe = socketService.subscribeToContentUpdates(
      id,
      (updatedContent) => {
        console.log("Received real-time content update:", updatedContent);

        // Update the cache with new content data
        queryClient.setQueryData(queryKey, updatedContent.data);

        // Show a toast notification
        // toast.info('Content has been updated');
      }
    );

    // Cleanup subscription when component unmounts or ID changes
    return () => {
      unsubscribe();
    };
  }, [id, queryClient, queryKey]);

  return query;
}

export const useCreateContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateContentWithBlocksDto) => contentService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contents"] }),
  });
};

export const useUpdateContent = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateContentDto) => contentService.update(id, dto),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["content", id] });
      qc.invalidateQueries({ queryKey: ["contents"] });
      return data;
    },
  });
};

export const useDeleteContent = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => contentService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contents"] });
      qc.removeQueries({ queryKey: QK.detail(id) });
    },
  });
};

export const useRestoreContent = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => contentService.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contents"] });
      qc.invalidateQueries({ queryKey: ["contents", "deleted"] });
    },
  });
};

export const usePermanentDeleteContent = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => contentService.permanentDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contents", "deleted"] });
      qc.removeQueries({ queryKey: QK.detail(id) });
    },
  });
};
