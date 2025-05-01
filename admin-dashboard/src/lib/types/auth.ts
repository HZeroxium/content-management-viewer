// src/lib/types/auth.ts

/**
 * Payload for user registration
 */
export interface RegisterDto {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
}

/**
 * Payload for user login
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Payload for changing password
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Response from login endpoint
 */
export interface AuthResponse {
  accessToken: string;
}

/**
 * User profile returned by /auth/profile
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor" | "client";
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}
