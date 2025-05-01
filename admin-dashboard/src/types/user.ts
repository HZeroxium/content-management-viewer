// src/types/user.ts
import { PaginatedResponseDto } from "./content";

export type Role = "admin" | "editor" | "client";

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string; // Added as optional since it appears to be used in the codebase
  createdAt?: string;
  updatedAt?: string;
}

// Reuse the pagination structure to be consistent
export type PaginatedResponse<T = User> = PaginatedResponseDto<T>;
