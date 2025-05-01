// src/types/user.ts
import { PaginatedResponseDto } from "./content";

export type Role = "admin" | "editor" | "client";

export interface User {
  id?: string;
  email: string;
  password?: string; // Make password optional for updates
  name: string;
  role: "admin" | "editor" | "client";
  createdAt?: string;
  updatedAt?: string;
}

// Reuse the pagination structure to be consistent
export type PaginatedResponse<T = User> = PaginatedResponseDto<T>;
