// src/lib/hooks/api/useUsers.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { usersService } from "@/lib/api/services/users.service";
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from "@/lib/types/user";

import type { PaginatedResponse, PaginationQuery } from "@/lib/types/base";

const QK = {
  list: (p: PaginationQuery) => ["users", p],
  deleted: (p: PaginationQuery) => ["users", "deleted", p],
  detail: (id: string) => ["user", id],
} as const;

export const useUsers = (params: PaginationQuery) =>
  useQuery<PaginatedResponse<UserResponseDto>>({
    queryKey: QK.list(params),
    queryFn: () => usersService.fetchAll(params),
    placeholderData: keepPreviousData,
  });

export const useDeletedUsers = (params: PaginationQuery) =>
  useQuery<PaginatedResponse<UserResponseDto>>({
    queryKey: QK.deleted(params),
    queryFn: () => usersService.fetchDeleted(params),
    enabled: !!params,
    placeholderData: keepPreviousData,
  });

export const useUser = (id: string) =>
  useQuery<UserResponseDto>({
    queryKey: QK.detail(id),
    queryFn: () => usersService.fetchById(id),
    enabled: !!id,
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateUserDto) => usersService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
};

export const useUpdateUser = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateUserDto) => usersService.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.detail(id) });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeleteUser = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => usersService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
};
