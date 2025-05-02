// /src/modules/content/content.service.ts

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content, ContentDocument } from './schemas/content.schema';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentGateway } from '@websocket/content.gateway';
import { ContentResponseDto } from './dto/content-response.dto';
import { CreateContentWithBlocksDto } from './dto/create-content-with-blocks.dto';
import { BaseCrudService } from '@common/services/base-crud.service';
import { TransactionService } from '@common/services/transaction.service';
import { ContentProcessorService } from './services/content-processor.service';
import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '@/common/dto/pagination.dto';

@Injectable()
export class ContentService extends BaseCrudService<
  ContentDocument,
  CreateContentWithBlocksDto,
  UpdateContentDto,
  ContentResponseDto
> {
  protected readonly logger = new Logger(ContentService.name);

  constructor(
    @InjectModel(Content.name) protected readonly model: Model<ContentDocument>,
    private readonly gateway: ContentGateway,
    private readonly transactionService: TransactionService,
    private readonly contentProcessor: ContentProcessorService,
  ) {
    super();
  }

  protected toResponseDto(entity: any): ContentResponseDto {
    return ContentResponseDto.fromEntity(entity);
  }

  /**
   * Create content with multiple block types in a transaction if available
   */
  async createContentWithBlocks(
    dto: CreateContentWithBlocksDto,
    userId: string,
  ): Promise<{ content: ContentResponseDto; transactionId: string }> {
    return this.transactionService.withTransaction(async (context) => {
      try {
        // Process all blocks (text, image, video)
        const processedBlocks = await this.contentProcessor.processBlocks(
          dto.blocks,
          userId,
        );

        // Build the content payload
        const contentData = {
          title: dto.title,
          description: dto.description,
          blocks: processedBlocks,
          metadata: {
            createdVia: 'content-endpoint',
            blockCount: processedBlocks.length,
            fileReferences: processedBlocks
              .filter((b) => b.metadata?.fileId)
              .map((b) => b.metadata!.fileId),
            ...dto.metadata,
          },
          createdBy: userId,
          updatedBy: userId,
        };

        // Save WITH or WITHOUT transaction
        let savedContent;
        const content = new this.model(contentData);

        if (context.useTransaction && context.session) {
          savedContent = await content.save({ session: context.session });
          this.logger.log(
            `[${context.transactionId}] Content created successfully in transaction.`,
          );
        } else {
          savedContent = await content.save();
          this.logger.log(
            `[${context.transactionId}] Content created successfully without transaction.`,
          );
        }

        // Broadcast via WebSocket
        const contentDto = this.toResponseDto(savedContent);
        this.broadcastContentUpdate('create', contentDto);

        return {
          content: contentDto,
          transactionId: context.transactionId,
        };
      } catch (error) {
        this.logger.error(
          `[${context.transactionId}] Failed to create content: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    });
  }

  /**
   * Override the findAll method to customize filters
   */
  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ContentResponseDto>> {
    return super.findAll(query);
  }

  /**
   * Find deleted content with pagination
   */
  async findDeleted(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ContentResponseDto>> {
    return super.findDeleted(query);
  }

  /**
   * Override find one to handle includes deleted
   */
  async findOne(
    id: string,
    includeDeleted = false,
  ): Promise<ContentResponseDto> {
    try {
      const filter = includeDeleted
        ? { _id: id }
        : { _id: id, deletedAt: null };

      const content = await this.model.findOne(filter).lean().exec();

      if (!content) {
        throw new NotFoundException(`Content ${id} not found`);
      }

      return this.toResponseDto(content);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find content ${id}: ${error.message}`,
        error.stack,
      );
      throw new NotFoundException(`Content ${id} not found`);
    }
  }

  /**
   * Override update to add websocket broadcast
   */
  async update(
    id: string,
    dto: UpdateContentDto,
    updatedBy: string,
  ): Promise<ContentResponseDto> {
    try {
      const updated = await super.update(id, dto, updatedBy);
      this.broadcastContentUpdate('update', updated);
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to update content ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to update content: ${error.message}`,
      );
    }
  }

  /**
   * Override softDelete to add broadcasting
   */
  async remove(
    id: string,
    deletedBy: string,
  ): Promise<{ content: ContentResponseDto; message: string }> {
    try {
      const result = await super.softDelete(id, deletedBy);

      // Broadcast via WebSocket
      this.gateway.broadcastContentUpdate({
        action: 'delete',
        id,
        deleted: true,
      });

      return {
        content: result.item,
        message: `Content "${result.item.title}" has been successfully deleted`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to soft delete content ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to delete content: ${error.message}`,
      );
    }
  }

  /**
   * Override restore with broadcasting
   */
  async restore(id: string, restoredBy: string): Promise<ContentResponseDto> {
    try {
      const restored = await super.restore(id, restoredBy);

      // Broadcast restoration
      this.broadcastContentUpdate('restore', restored);

      // Log the success message but return only the DTO
      this.logger.log(
        `Content "${restored.title}" has been successfully restored`,
      );

      return restored;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to restore content ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to restore content: ${error.message}`,
      );
    }
  }

  /**
   * Override hardDelete to add broadcasting
   */
  async permanentDelete(id: string): Promise<{
    id: string;
    deleted: boolean;
    message: string;
    title?: string;
  }> {
    try {
      const content = await this.findOne(id, true);
      const contentTitle = content.title;

      await super.hardDelete(id);

      // Broadcast permanent deletion
      this.gateway.broadcastContentUpdate({
        action: 'delete',
        id,
        deleted: true,
        permanent: true,
      });

      return {
        id,
        deleted: true,
        message: `Content "${contentTitle}" has been permanently deleted`,
        title: contentTitle,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to permanently delete content ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to permanently delete content: ${error.message}`,
      );
    }
  }

  /**
   * Helper to broadcast content updates with consistent structure
   */
  private broadcastContentUpdate(
    action: string,
    content: ContentResponseDto,
  ): void {
    this.gateway.broadcastContentUpdate({
      action,
      content,
    });
  }
}
