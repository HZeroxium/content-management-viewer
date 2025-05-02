// src/lib/types/file.ts

/**
 * Payload when uploading a file
 */
export interface UploadFileDto {
  folder?: string;
  fileName?: string; // Make sure this matches the backend DTO field name
  isPrivate?: boolean;
  metadata?: Record<string, string>;
}

/**
 * Payload when updating file metadata
 */
export interface UpdateFileDto {
  filename?: string;
  folder?: string;
  isPrivate?: boolean;
  metadata?: Record<string, string>;
}

/**
 * Standard file record returned by the API
 */
export interface FileResponseDto {
  id: string;
  filename: string;
  originalName: string;
  key: string;
  url: string;
  contentType: string;
  size: number;
  folder: string | null;
  isPrivate: boolean;
  metadata: Record<string, string>;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  createdBy: string;
  updatedBy: string;
  deletedAt: string | null;
  deletedBy: string | null;
}
