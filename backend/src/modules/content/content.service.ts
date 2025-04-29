// /src/modules/content/content.service.ts

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content, ContentDocument } from './schemas/content.schema';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentGateway } from '@websocket/content.gateway';
import { ContentResponseDto } from './dto/content-response.dto';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
} from '@common/dto/pagination.dto';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>,
    private readonly gateway: ContentGateway,
  ) {}

  /** Create new content, record who created it */
  async create(
    dto: CreateContentDto,
    createdBy: string,
  ): Promise<ContentResponseDto> {
    try {
      const created = new this.contentModel({
        ...dto,
        createdBy,
        updatedBy: createdBy,
      });

      const savedContent = await created.save();

      // broadcast after create
      this.gateway.broadcastContentUpdate(savedContent);

      this.logger.log(`Content created: ${savedContent._id} by ${createdBy}`);
      return ContentResponseDto.fromEntity(savedContent);
    } catch (error) {
      this.logger.error(
        `Failed to create content: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to create content: ${error.message}`,
      );
    }
  }

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
      this.gateway.broadcastContentUpdate(responseDto);

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
      this.gateway.broadcastContentUpdate({ id, deleted: true });

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
      this.gateway.broadcastContentUpdate(responseDto);

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
