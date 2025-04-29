// /src/modules/files/dto/file-response.dto.ts

/**
 * Standardized file response format
 */
export class FileResponseDto {
  id: string;
  filename: string;
  originalName: string;
  key: string;
  url: string;
  contentType: string;
  size: number;
  folder?: string;
  isPrivate: boolean;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
  deletedBy?: string | null;

  // Helper method to convert from File entity to DTO
  static fromEntity(file: any): FileResponseDto {
    return {
      id: file._id?.toString(),
      filename: file.filename,
      originalName: file.originalName,
      key: file.key,
      url: file.url,
      contentType: file.contentType,
      size: file.size,
      folder: file.folder,
      isPrivate: file.isPrivate,
      metadata: file.metadata,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      createdBy: file.createdBy,
      updatedBy: file.updatedBy,
      deletedAt: file.deletedAt,
      deletedBy: file.deletedBy,
    };
  }
}
