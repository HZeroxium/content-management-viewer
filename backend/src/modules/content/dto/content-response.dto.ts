// /src/modules/content/dto/content-response.dto.ts

/**
 * Standardized content response format
 */
export class ContentResponseDto {
  id: string;
  title: string;
  description?: string;
  blocks: any[];
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
  deletedBy?: string | null;

  // Helper method to convert from Content entity to DTO
  static fromEntity(content: any): ContentResponseDto {
    return {
      id: content._id?.toString(),
      title: content.title,
      description: content.description,
      blocks: content.blocks || [],
      metadata: content.metadata || {},
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
      createdBy: content.createdBy,
      updatedBy: content.updatedBy,
      deletedAt: content.deletedAt,
      deletedBy: content.deletedBy,
    };
  }
}
