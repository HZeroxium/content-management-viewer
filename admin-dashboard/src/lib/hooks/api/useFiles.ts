// src/lib/hooks/api/useFiles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { filesService } from "@/lib/api/services/files.service";
import {
  FileResponseDto,
  UploadFileDto,
  UpdateFileDto,
} from "@/lib/types/file";
import type { PaginationQuery } from "@/lib/types/base";

// Files query keys
export const filesKeys = {
  all: ["files"] as const,
  lists: () => [...filesKeys.all, "list"] as const,
  list: (filters: PaginationQuery) =>
    [...filesKeys.lists(), { ...filters }] as const,
  deleted: () => [...filesKeys.all, "deleted"] as const,
  deletedList: (filters: PaginationQuery) =>
    [...filesKeys.deleted(), { ...filters }] as const,
  details: () => [...filesKeys.all, "detail"] as const,
  detail: (id: string) => [...filesKeys.details(), id] as const,
};

// Hook to fetch files with pagination
export function useFiles(params: PaginationQuery & { deleted?: boolean }) {
  const { deleted, ...paginationParams } = params;

  return useQuery({
    queryKey: deleted
      ? filesKeys.deletedList(paginationParams)
      : filesKeys.list(paginationParams),
    queryFn: () =>
      deleted
        ? filesService.fetchDeleted(paginationParams)
        : filesService.fetchAll(paginationParams),
  });
}

export const useFile = (id: string) =>
  useQuery<FileResponseDto>({
    queryKey: filesKeys.detail(id),
    queryFn: () => filesService.fetchById(id),
    enabled: !!id,
  });

export const useUploadFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, dto }: { file: File; dto: UploadFileDto }) =>
      filesService.upload(file, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: filesKeys.all }),
    onError: (error) => {
      // Log detailed error information
      console.error("File upload mutation error:", error);
    },
  });
};

export const useUpdateFile = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateFileDto) => filesService.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: filesKeys.detail(id) });
      qc.invalidateQueries({ queryKey: filesKeys.all });
    },
  });
};

export const useDeleteFile = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => filesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: filesKeys.all }),
  });
};

export const useRestoreFile = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => filesService.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: filesKeys.all });
      qc.invalidateQueries({ queryKey: filesKeys.deleted() });
    },
  });
};

export const usePermanentDeleteFile = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => filesService.permanentDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: filesKeys.deleted() });
      qc.removeQueries({ queryKey: filesKeys.detail(id) });
    },
  });
};
