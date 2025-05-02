// src/lib/api/services/auth.service.ts
import api from "@/lib/api/core/axios";
import { endpoints } from "@/lib/api/endpoints";
import { formatErrorForLogging } from "@/lib/types/error";
import type {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  UserProfile,
} from "@/lib/types/auth";

export const authService = {
  async register(data: RegisterDto): Promise<void> {
    try {
      await api.post(endpoints.auth.register, data);
    } catch (error) {
      console.group("Auth Service Error - Register");
      console.error(formatErrorForLogging(error));
      console.groupEnd();
      throw error;
    }
  },

  async login(data: LoginDto): Promise<{ accessToken: string }> {
    try {
      const { data: res } = await api.post<{ accessToken: string }>(
        endpoints.auth.login,
        data
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", res.accessToken);
      }
      return res;
    } catch (error) {
      console.group("Auth Service Error - Login");
      console.error(formatErrorForLogging(error));
      console.groupEnd();
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post(endpoints.auth.logout);
      if (typeof window !== "undefined") localStorage.removeItem("accessToken");
    } catch (error) {
      console.group("Auth Service Error - Logout");
      console.error(formatErrorForLogging(error));
      console.groupEnd();
      throw error;
    }
  },

  async changePassword(dto: ChangePasswordDto): Promise<void> {
    try {
      await api.post(endpoints.auth.changePassword, dto);
    } catch (error) {
      console.group("Auth Service Error - Change Password");
      console.error(formatErrorForLogging(error));
      console.groupEnd();
      throw error;
    }
  },

  async getProfile(): Promise<UserProfile> {
    try {
      const { data } = await api.get<UserProfile>(endpoints.auth.profile);
      return data;
    } catch (error) {
      console.group("Auth Service Error - Get Profile");
      console.error(formatErrorForLogging(error));
      console.groupEnd();
      throw error;
    }
  },
};
