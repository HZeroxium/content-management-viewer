// src/lib/types/content.ts

// Types for content management

// Define the content block types
export interface ContentBlockDto {
  type: "text" | "image" | "video";
  text?: string; // For text blocks
  url?: string; // For image/video blocks
  fileId?: string; // For file references
  metadata?: Record<string, unknown>;
}

// Main content DTO
export interface ContentResponseDto {
  id: string;
  title: string;
  description?: string;
  blocks: ContentBlockDto[];
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

// Update DTO
export interface UpdateContentDto {
  title?: string;
  description?: string;
  blocks?: ContentBlockDto[];
  metadata?: Record<string, unknown>;
}

// Create DTO with blocks
export interface CreateContentWithBlocksDto {
  title: string;
  description?: string;
  slug?: string;
  metadata?: Record<string, unknown>;
  blocks: ContentBlockDto[];
}
