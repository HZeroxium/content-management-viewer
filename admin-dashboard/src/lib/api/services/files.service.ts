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

    // Fix: Properly handle optional fields and ensure proper naming
    if (dto.folder) form.append("folder", dto.folder);
    if (dto.fileName) form.append("fileName", dto.fileName);
    if (dto.isPrivate !== undefined)
      form.append("private", String(dto.isPrivate));

    // Fix: Handle metadata properly - if it's an object, stringify it
    if (dto.metadata) form.append("metadata", JSON.stringify(dto.metadata));

    try {
      const { data } = await api.post<{
        success: boolean;
        data: FileResponseDto;
        message: string;
      }>(endpoints.files.upload, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return data.data; // Return the actual FileResponseDto from the response
    } catch (error: unknown) {
      console.error("File upload error:", error);

      // Type narrowing
      if (error && typeof error === "object" && "response" in error) {
        const typedError = error as {
          response?: { data?: { message?: string } };
        };
        if (typedError.response?.data?.message) {
          throw new Error(typedError.response.data.message);
        }
      }
      throw error;
    }
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
