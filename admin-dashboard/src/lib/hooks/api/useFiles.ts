// src/lib/hooks/api/useFiles.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { filesService } from "@/lib/api/services/files.service";
import {
  FileResponseDto,
  UploadFileDto,
  UpdateFileDto,
} from "@/lib/types/file";

import type { PaginatedResponse, PaginationQuery } from "@/lib/types/base";

interface FilesQueryParams extends PaginationQuery {
  deleted?: boolean;
}

const QK = {
  list: (p: FilesQueryParams) =>
    p.deleted ? ["files", "deleted", p] : ["files", p],
  detail: (id: string) => ["file", id],
} as const;

export const useFiles = (params: FilesQueryParams) =>
  useQuery<PaginatedResponse<FileResponseDto>>({
    queryKey: QK.list(params),
    queryFn: () =>
      params.deleted
        ? filesService.fetchAll(params)
        : filesService.fetchAll(params),
    placeholderData: keepPreviousData,
  });

export const useFile = (id: string) =>
  useQuery<FileResponseDto>({
    queryKey: QK.detail(id),
    queryFn: () => filesService.fetchById(id),
    enabled: !!id,
  });

export const useUploadFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, dto }: { file: File; dto: UploadFileDto }) =>
      filesService.upload(file, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["files"] }),
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
      qc.invalidateQueries({ queryKey: QK.detail(id) });
      qc.invalidateQueries({ queryKey: ["files"] });
    },
  });
};

export const useDeleteFile = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => filesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["files"] }),
  });
};

export const useRestoreFile = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => filesService.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["files"] });
      qc.invalidateQueries({ queryKey: ["files", "deleted"] });
    },
  });
};

export const usePermanentDeleteFile = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => filesService.permanentDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["files", "deleted"] });
      qc.removeQueries({ queryKey: QK.detail(id) });
    },
  });
};
