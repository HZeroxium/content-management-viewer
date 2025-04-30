// /src/modules/content/content.service.ts

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, ClientSession } from 'mongoose';
import { Content, ContentDocument, Block } from './schemas/content.schema';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentGateway } from '@websocket/content.gateway';
import { ContentResponseDto } from './dto/content-response.dto';
import {
  CreateContentWithBlocksDto,
  ContentBlockDto,
} from './dto/create-content-with-blocks.dto';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
} from '@common/dto/pagination.dto';
import { FilesService } from '@modules/files/files.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>,
    @InjectConnection() private connection: Connection,
    private readonly gateway: ContentGateway,
    private readonly filesService: FilesService,
  ) {}

  /**
   * Create content with multiple block types.
   * If a replica set is detected, wrap in a transaction; otherwise just save.
   */
  async createContentWithBlocks(
    dto: CreateContentWithBlocksDto,
    userId: string,
  ): Promise<{ content: ContentResponseDto; transactionId: string }> {
    const transactionId = uuidv4();
    let session: ClientSession | null = null;
    let useTransaction = false;

    // 1) Check for replica set support
    try {
      const admin = this.connection.db?.admin();
      if (!admin) {
        throw new Error('Database connection not available');
      }
      const isMaster = await admin.command({ isMaster: 1 });
      if (isMaster.setName) {
        // Replica set detected → enable transactions
        session = await this.connection.startSession();
        session.startTransaction(); // will only attach txnNumber later on operations
        useTransaction = true;
        this.logger.log(
          `[${transactionId}] Replica set detected – using transactions.`,
        );
      } else {
        this.logger.log(
          `[${transactionId}] No replica set detected – proceeding without transactions.`,
        );
      }
    } catch (checkErr) {
      // If we can’t even run isMaster, assume standalone and skip transactions
      this.logger.log(
        `[${transactionId}] Could not check replica set status (proceeding without transactions): ${checkErr.message}`,
      );
    }

    try {
      // 2) Process all blocks (text, image, video)
      const processedBlocks: Block[] = await this.processContentBlocks(
        dto.blocks,
        userId,
      );

      // 3) Build the content payload
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

      // 4) Save WITH or WITHOUT transaction
      let savedContent;
      const content = new this.contentModel(contentData);

      if (useTransaction && session) {
        // Attempt to save inside transaction
        savedContent = await content.save({ session });
        await session.commitTransaction();
        this.logger.log(
          `[${transactionId}] Content created successfully in transaction.`,
        );
      } else {
        // Fallback: simple save
        savedContent = await content.save();
        this.logger.log(
          `[${transactionId}] Content created successfully without transaction.`,
        );
      }

      // 5) Broadcast via WebSocket
      const contentDto = ContentResponseDto.fromEntity(savedContent);
      this.gateway.broadcastContentUpdate({
        action: 'create',
        content: contentDto,
      });

      return { content: contentDto, transactionId };
    } catch (error) {
      // If we started a transaction, roll it back
      if (session && useTransaction) {
        try {
          await session.abortTransaction();
        } catch (abortErr) {
          this.logger.error(
            `[${transactionId}] Failed to abort transaction: ${abortErr.message}`,
          );
        }
      }

      // Log and rethrow known errors
      this.logger.error(
        `[${transactionId}] Failed to create content: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create content: ${error.message}`,
      );
    } finally {
      // Always end the session if we started one
      if (session) {
        session.endSession().catch((endErr) => {
          this.logger.error(
            `[${transactionId}] Failed to end session: ${endErr.message}`,
          );
        });
      }
    }
  }

  /**
   * Process and validate content blocks including file references
   * @private
   */
  private async processContentBlocks(
    blocks: ContentBlockDto[],
    userId: string,
  ): Promise<Block[]> {
    const processedBlocks: Block[] = [];

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const processedBlock: Block = {
        type: block.type,
        metadata: { ...(block.metadata || {}) },
      };

      switch (block.type) {
        case 'text':
          if (!block.text) {
            throw new BadRequestException(
              `Block #${i + 1}: Text blocks require 'text' property`,
            );
          }
          processedBlock.text = block.text;
          processedBlock.metadata!.textType =
            block.metadata?.textType || 'paragraph';
          break;

        case 'image':
          if (block.url) {
            processedBlock.url = block.url;
          } else if (block.fileId) {
            try {
              const file = await this.filesService.findOne(block.fileId);
              processedBlock.url = file.url;
              Object.assign(processedBlock.metadata || (processedBlock.metadata = {}), {
                fileId: file.id,
                fileName: file.filename,
                fileType: file.contentType,
                fileSize: file.size,
                uploadedBy: file.createdBy,
              });
            } catch {
              throw new BadRequestException(
                `Block #${i + 1}: File with ID ${block.fileId} not found`,
              );
            }
          } else {
            throw new BadRequestException(
              `Block #${i + 1}: Image blocks require 'url' or 'fileId'`,
            );
          }
          break;

        case 'video':
          if (block.url) {
            processedBlock.url = block.url;
          } else if (block.fileId) {
            try {
              const file = await this.filesService.findOne(block.fileId);
              processedBlock.url = file.url;
              Object.assign(processedBlock.metadata || (processedBlock.metadata = {}), {
                fileId: file.id,
                fileName: file.filename,
                fileType: file.contentType,
                fileSize: file.size,
                uploadedBy: file.createdBy,
                duration: block.metadata?.duration,
                thumbnail: block.metadata?.thumbnail,
              });
            } catch {
              throw new BadRequestException(
                `Block #${i + 1}: File with ID ${block.fileId} not found`,
              );
            }
          } else {
            throw new BadRequestException(
              `Block #${i + 1}: Video blocks require 'url' or 'fileId'`,
            );
          }
          break;

        default:
          throw new BadRequestException(
            `Block #${i + 1}: Unsupported block type: ${block.type}`,
          );
      }

      // Track ordering
      processedBlock.metadata!.position = i;
      processedBlocks.push(processedBlock);
    }

    return processedBlocks;
  }

  // The rest of the service methods remain unchanged...
  /**
   * Find all active content with pagination
   * Excludes soft-deleted content
   */
  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ContentResponseDto>> {
    try {
      const { skip, limit = 10, sort, order } = query;

      // Build filter to exclude soft-deleted content
      const filter = { deletedAt: null };

      // Build sort options
      const sortOptions: Record<string, 1 | -1> = {};
      if (sort) {
        sortOptions[sort] = order === 'desc' ? -1 : 1;
      } else {
        sortOptions['createdAt'] = -1; // Default sort
      }

      // Execute query with pagination
      const [contents, total] = await Promise.all([
        this.contentModel
          .find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.contentModel.countDocuments(filter).exec(),
      ]);

      // Map results to DTOs
      const contentDtos = contents.map((content) =>
        ContentResponseDto.fromEntity(content),
      );

      return PaginatedResponseDto.create(contentDtos, total, query);
    } catch (error) {
      this.logger.error(
        `Failed to fetch content: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch content');
    }
  }

  /**
   * Find deleted content with pagination
   */
  async findDeleted(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ContentResponseDto>> {
    try {
      const { skip, limit = 10, sort, order } = query;

      // Build filter for only deleted content
      const filter = { deletedAt: { $ne: null } };

      // Build sort options
      const sortOptions: Record<string, 1 | -1> = {};
      if (sort) {
        sortOptions[sort] = order === 'desc' ? -1 : 1;
      } else {
        sortOptions['deletedAt'] = -1; // Default sort for deleted items
      }

      const [contents, total] = await Promise.all([
        this.contentModel
          .find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.contentModel.countDocuments(filter).exec(),
      ]);

      const contentDtos = contents.map((content) =>
        ContentResponseDto.fromEntity(content),
      );

      return PaginatedResponseDto.create(contentDtos, total, query);
    } catch (error) {
      this.logger.error(
        `Failed to fetch deleted content: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch deleted content');
    }
  }

  /** Find one by ID, throw if not found */
  async findOne(
    id: string,
    includeDeleted = false,
  ): Promise<ContentResponseDto> {
    try {
      const filter = includeDeleted
        ? { _id: id }
        : { _id: id, deletedAt: null };

      const content = await this.contentModel.findOne(filter).lean().exec();

      if (!content) {
        throw new NotFoundException(`Content ${id} not found`);
      }

      return ContentResponseDto.fromEntity(content);
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

  /** Update, record who did it */
  async update(
    id: string,
    dto: UpdateContentDto,
    updatedBy: string,
  ): Promise<ContentResponseDto> {
    try {
      // Check if content exists first
      await this.findOne(id);

      const update = { ...dto, updatedBy };
      const content = await this.contentModel
        .findOneAndUpdate({ _id: id, deletedAt: null }, update, { new: true })
        .lean()
        .exec();

      if (!content) {
        throw new NotFoundException(`Content ${id} not found`);
      }

      const responseDto = ContentResponseDto.fromEntity(content);

      // broadcast after update
      this.gateway.broadcastContentUpdate({
        action: 'update',
        content: responseDto,
      });

      this.logger.log(`Content ${id} updated by ${updatedBy}`);

      return responseDto;
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
   * Soft delete content
   * Sets deletedAt and deletedBy fields
   */
  async remove(
    id: string,
    deletedBy: string,
  ): Promise<{
    content: ContentResponseDto;
    message: string;
  }> {
    try {
      const content = await this.contentModel
        .findOneAndUpdate(
          { _id: id, deletedAt: null },
          { deletedAt: new Date(), deletedBy },
          { new: true },
        )
        .lean()
        .exec();

      if (!content) {
        throw new NotFoundException(`Content ${id} not found`);
      }

      const responseDto = ContentResponseDto.fromEntity(content);

      // broadcast deletion
      this.gateway.broadcastContentUpdate({
        action: 'delete',
        id,
        deleted: true,
      });

      this.logger.log(`Content ${id} soft deleted by ${deletedBy}`);

      return {
        content: responseDto,
        message: `Content "${content.title}" has been successfully deleted`,
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
   * Restore soft-deleted content
   */
  async restore(
    id: string,
    restoredBy: string,
  ): Promise<{
    content: ContentResponseDto;
    message: string;
  }> {
    try {
      const content = await this.contentModel
        .findOneAndUpdate(
          { _id: id, deletedAt: { $ne: null } },
          { deletedAt: null, deletedBy: null, updatedBy: restoredBy },
          { new: true },
        )
        .lean()
        .exec();

      if (!content) {
        throw new NotFoundException(
          `Content ${id} not found or already active`,
        );
      }

      const responseDto = ContentResponseDto.fromEntity(content);

      // broadcast restoration
      this.gateway.broadcastContentUpdate({
        action: 'restore',
        content: responseDto,
      });

      this.logger.log(`Content ${id} restored by ${restoredBy}`);

      return {
        content: responseDto,
        message: `Content "${content.title}" has been successfully restored`,
      };
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
   * Permanently delete content
   * For administrative purposes only
   */
  async permanentDelete(id: string): Promise<{
    id: string;
    deleted: boolean;
    message: string;
    title?: string;
  }> {
    try {
      const content = await this.contentModel.findById(id).lean().exec();
      if (!content) {
        throw new NotFoundException(`Content ${id} not found`);
      }

      const contentTitle = content.title;
      const res = await this.contentModel.findByIdAndDelete(id).exec();

      if (!res) {
        throw new BadRequestException('Database operation failed');
      }

      // broadcast permanent deletion
      this.gateway.broadcastContentUpdate({
        action: 'delete',
        id,
        deleted: true,
        permanent: true,
      });

      this.logger.log(`Content ${id} permanently deleted`);

      return {
        id,
        deleted: true,
        message: `Content "${contentTitle}" has been permanently deleted`,
        title: contentTitle,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
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
}
