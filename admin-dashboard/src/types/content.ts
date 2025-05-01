// src/types/content.ts

// Common response format
export interface PaginatedResponseDto<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Content block interfaces
export interface ContentBlock {
  id: string;
  type: string; // 'text', 'image', 'video', etc.
  content: string;
  position: number;
  metadata?: Record<string, unknown>; // Replace 'any' with 'unknown'
}

// Main content interface
export interface Content {
  id: string;
  title: string;
  description?: string;
  blocks: ContentBlock[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy?: string;
  updatedBy?: string;
}

// Type alias for paginated content
export type PaginatedContent = PaginatedResponseDto<Content>;
