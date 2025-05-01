// src/lib/api/services/files.service.ts
import api from "@/lib/api/core/axios";
import { endpoints } from "@/lib/api/endpoints";
import type {
  FileResponseDto,
  UploadFileDto,
  UpdateFileDto,
} from "@/lib/types/file";

import type { PaginatedResponse, PaginationQuery } from "@/lib/types/base";

export const filesService = {
  async fetchAll(
    params: PaginationQuery
  ): Promise<PaginatedResponse<FileResponseDto>> {
    const { data } = await api.get<PaginatedResponse<FileResponseDto>>(
      endpoints.files.root,
      { params }
    );
    return data;
  },

  async fetchById(id: string): Promise<FileResponseDto> {
    const { data } = await api.get<FileResponseDto>(
      `${endpoints.files.root}/${id}`
    );
    return data;
  },

  async upload(file: File, dto: UploadFileDto): Promise<FileResponseDto> {
    const form = new FormData();
    form.append("file", file);
    if (dto.folder) form.append("folder", dto.folder);
    if (dto.isPrivate !== undefined)
      form.append("private", String(dto.isPrivate));
    if (dto.metadata) form.append("metadata", JSON.stringify(dto.metadata));

    const { data } = await api.post<FileResponseDto>(
      endpoints.files.upload,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  async update(id: string, dto: UpdateFileDto): Promise<FileResponseDto> {
    const { data } = await api.patch<FileResponseDto>(
      `${endpoints.files.root}/${id}`,
      dto
    );
    return data;
  },

  async remove(
    id: string
  ): Promise<{ file: FileResponseDto; message: string }> {
    const { data } = await api.delete<{
      file: FileResponseDto;
      message: string;
    }>(`${endpoints.files.root}/${id}`);
    return data;
  },

  async restore(
    id: string
  ): Promise<{ data: FileResponseDto; message: string }> {
    const { data } = await api.post<{ data: FileResponseDto; message: string }>(
      endpoints.files.restore(id)
    );
    return data;
  },

  async permanentDelete(id: string): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(
      endpoints.files.permanent(id)
    );
    return data;
  },

  async deleteFromStorage(key: string): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(
      endpoints.files.storageDelete(key)
    );
    return data;
  },

  async listStorage(
    folder?: string,
    maxKeys?: number
  ): Promise<{ keys: string[] }> {
    const params: Record<string, string> = {};
    if (folder) params.folder = folder;
    if (maxKeys !== undefined) params.maxKeys = String(maxKeys);

    const { data } = await api.get<{ keys: string[] }>(
      endpoints.files.storageList,
      { params }
    );
    return data;
  },
};
