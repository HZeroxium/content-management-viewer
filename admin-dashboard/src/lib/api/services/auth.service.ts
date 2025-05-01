// src/lib/api/services/auth.service.ts
import api from "@/lib/api/core/axios";
import { endpoints } from "@/lib/api/endpoints";
import type {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  UserProfile,
} from "@/lib/types/auth";

export const authService = {
  async register(data: RegisterDto): Promise<void> {
    await api.post(endpoints.auth.register, data);
  },

  async login(data: LoginDto): Promise<{ accessToken: string }> {
    const { data: res } = await api.post<{ accessToken: string }>(
      endpoints.auth.login,
      data
    );
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", res.accessToken);
    }
    return res;
  },

  async logout(): Promise<void> {
    await api.post(endpoints.auth.logout);
    if (typeof window !== "undefined") localStorage.removeItem("accessToken");
  },

  async changePassword(dto: ChangePasswordDto): Promise<void> {
    await api.post(endpoints.auth.changePassword, dto);
  },

  async getProfile(): Promise<UserProfile> {
    const { data } = await api.get<UserProfile>(endpoints.auth.profile);
    return data;
  },
};
