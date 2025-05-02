// src/lib/api/services/content.service.ts
import api from "@/lib/api/core/axios";
import { endpoints } from "@/lib/api/endpoints";
import type {
  ContentResponseDto,
  CreateContentWithBlocksDto,
  UpdateContentDto,
} from "@/lib/types/content";

import type { PaginatedResponse, PaginationQuery } from "@/lib/types/base";

export const contentService = {
  async create(
    dto: CreateContentWithBlocksDto
  ): Promise<{ content: ContentResponseDto; transactionId: string }> {
    try {
      const { data } = await api.post<{
        content: ContentResponseDto;
        transactionId: string;
        success: boolean;
        message: string;
      }>(endpoints.content.root, dto);
      return {
        content: data.content,
        transactionId: data.transactionId,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create content";
      throw new Error(errorMessage);
    }
  },

  async fetchAll(
    params: PaginationQuery
  ): Promise<PaginatedResponse<ContentResponseDto>> {
    try {
      const { data } = await api.get<PaginatedResponse<ContentResponseDto>>(
        endpoints.content.root,
        { params }
      );
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch content list";
      throw new Error(errorMessage);
    }
  },

  async fetchDeleted(
    params: PaginationQuery
  ): Promise<PaginatedResponse<ContentResponseDto>> {
    try {
      const { data } = await api.get<PaginatedResponse<ContentResponseDto>>(
        endpoints.content.deleted,
        { params }
      );
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch deleted content";
      throw new Error(errorMessage);
    }
  },

  async fetchById(id: string): Promise<ContentResponseDto> {
    try {
      const { data } = await api.get<ContentResponseDto>(
        `${endpoints.content.root}/${id}`
      );
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to fetch content with ID ${id}`;
      throw new Error(errorMessage);
    }
  },

  async update(id: string, dto: UpdateContentDto): Promise<ContentResponseDto> {
    try {
      const { data } = await api.patch<{
        success: boolean;
        content: ContentResponseDto;
        message: string;
      }>(`${endpoints.content.root}/${id}`, dto);
      return data.content;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to update content with ID ${id}`;
      throw new Error(errorMessage);
    }
  },

  async remove(id: string): Promise<ContentResponseDto> {
    try {
      const { data } = await api.delete<{
        success: boolean;
        content: ContentResponseDto;
        message: string;
      }>(`${endpoints.content.root}/${id}`);
      return data.content;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to delete content with ID ${id}`;
      throw new Error(errorMessage);
    }
  },

  async restore(id: string): Promise<ContentResponseDto> {
    try {
      const { data } = await api.post<{
        success: boolean;
        content: ContentResponseDto;
        message: string;
      }>(endpoints.content.restore(id));
      return data.content;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to restore content with ID ${id}`;
      throw new Error(errorMessage);
    }
  },

  async permanentDelete(id: string): Promise<{
    id: string;
    deleted: boolean;
    message: string;
    title?: string;
  }> {
    try {
      const { data } = await api.delete<{
        success: boolean;
        id: string;
        deleted: boolean;
        message: string;
        title?: string;
      }>(endpoints.content.permanent(id));
      return {
        id: data.id,
        deleted: data.deleted,
        message: data.message,
        title: data.title,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to permanently delete content with ID ${id}`;
      throw new Error(errorMessage);
    }
  },

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const { data } = await api.get<{ status: string; timestamp: string }>(
        endpoints.content.health
      );
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to check content service health";
      throw new Error(errorMessage);
    }
  },
};
