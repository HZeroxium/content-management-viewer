// src/lib/types/content.ts

// Types for content management

export interface ContentBlockDto {
  type: "text" | "image" | "video";
  content?: string;
  metadata?: {
    fileId?: string;
    fileUrl?: string;
    position?: number;
    [key: string]: unknown;
  };
}

export interface ContentResponseDto {
  id: string;
  title: string;
  description?: string;
  blocks: ContentBlockDto[];
  metadata: {
    status?: "draft" | "published" | "archived";
    [key: string]: unknown;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  deletedAt: string | null;
  deletedBy: string | null;
}

export interface CreateContentWithBlocksDto {
  title: string;
  description?: string;
  blocks: ContentBlockDto[];
  metadata?: {
    [key: string]: unknown;
  };
}

export interface UpdateContentDto {
  title?: string;
  description?: string;
  blocks?: ContentBlockDto[];
  metadata?: {
    [key: string]: unknown;
  };
}

export type Content = ContentResponseDto;
