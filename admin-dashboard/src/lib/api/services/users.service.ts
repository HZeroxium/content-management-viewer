// src/lib/api/services/users.service.ts
import api from "@/lib/api/core/axios";
import { endpoints } from "@/lib/api/endpoints";
import type {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from "@/lib/types/user";

import type { PaginatedResponse, PaginationQuery } from "@/lib/types/base";

export const usersService = {
  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const { data } = await api.post<UserResponseDto>(endpoints.users.root, dto);
    return data;
  },

  async fetchAll(
    params: PaginationQuery
  ): Promise<PaginatedResponse<UserResponseDto>> {
    const { data } = await api.get<PaginatedResponse<UserResponseDto>>(
      endpoints.users.root,
      { params }
    );
    return data;
  },

  async fetchDeleted(
    params: PaginationQuery
  ): Promise<PaginatedResponse<UserResponseDto>> {
    const { data } = await api.get<PaginatedResponse<UserResponseDto>>(
      endpoints.users.deleted,
      { params }
    );
    return data;
  },

  async fetchById(id: string): Promise<UserResponseDto> {
    const { data } = await api.get<UserResponseDto>(
      `${endpoints.users.root}/${id}`
    );
    return data;
  },

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const { data } = await api.patch<UserResponseDto>(
      `${endpoints.users.root}/${id}`,
      dto
    );
    return data;
  },

  async remove(id: string): Promise<UserResponseDto> {
    const { data } = await api.delete<UserResponseDto>(
      `${endpoints.users.root}/${id}`
    );
    return data;
  },

  async restore(id: string): Promise<UserResponseDto> {
    const { data } = await api.post<UserResponseDto>(
      endpoints.users.restore(id)
    );
    return data;
  },

  async permanentDelete(
    id: string
  ): Promise<{ id: string; deleted: boolean; message: string }> {
    const { data } = await api.delete<{
      id: string;
      deleted: boolean;
      message: string;
    }>(endpoints.users.permanent(id));
    return data;
  },
};
