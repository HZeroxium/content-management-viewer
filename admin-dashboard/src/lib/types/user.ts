// src/lib/types/user.ts

/**
 * DTO for creating a new user (admin-only)
 */
export interface CreateUserDto {
  email: string;
  password: string;
  name?: string;
  role: "admin" | "editor" | "client";
}

/**
 * DTO for updating user metadata
 */
export interface UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  role?: "admin" | "editor" | "client";
}

/**
 * Standard user record in responses
 */
export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor" | "client";
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  createdBy: string;
  updatedBy: string;
  deletedAt: string | null;
  deletedBy: string | null;
}

/**
 * User type alias for UserResponseDto
 */
export type User = UserResponseDto;
