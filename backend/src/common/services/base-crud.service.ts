// /src/common/services/base-crud.service.ts

import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '@common/dto/pagination.dto';

export abstract class BaseCrudService<T, CreateDto, UpdateDto, ResponseDto> {
  protected abstract model: Model<T>;
  protected abstract logger: Logger;

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ResponseDto>> {
    try {
      const { skip, limit = 10, sort, order } = query;

      // Build filter to exclude soft-deleted items
      const filter = { deletedAt: null };

      // Build sort options
      const sortOptions: Record<string, 1 | -1> = {};
      if (sort) {
        sortOptions[sort] = order === 'desc' ? -1 : 1;
      } else {
        sortOptions['createdAt'] = -1; // Default sort
      }

      // Execute query with pagination
      const [items, total] = await Promise.all([
        this.model
          .find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.model.countDocuments(filter).exec(),
      ]);

      // Transform to DTOs using abstract method
      const dtos = items.map((item) => this.toResponseDto(item));

      return PaginatedResponseDto.create(dtos, total, query);
    } catch (error) {
      this.logger.error(`Failed to fetch items: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch items');
    }
  }

  async findDeleted(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ResponseDto>> {
    try {
      const { skip, limit = 10, sort, order } = query;

      // Build filter to only include soft-deleted items
      const filter = { deletedAt: { $ne: null } };

      // Build sort options
      const sortOptions: Record<string, 1 | -1> = {};
      if (sort) {
        sortOptions[sort] = order === 'desc' ? -1 : 1;
      } else {
        // Default sort deleted items by deletedAt descending
        sortOptions['deletedAt'] = -1;
      }

      // Execute query with pagination
      const [items, total] = await Promise.all([
        this.model
          .find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.model.countDocuments(filter).exec(),
      ]);

      // Transform to DTOs using abstract method
      const dtos = items.map((item) => this.toResponseDto(item));

      return PaginatedResponseDto.create(dtos, total, query);
    } catch (error) {
      this.logger.error(
        `Failed to fetch deleted items: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch deleted items');
    }
  }

  async findOne(id: string): Promise<ResponseDto> {
    const item = await this.model
      .findOne({ _id: id, deletedAt: null })
      .lean()
      .exec();

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    return this.toResponseDto(item);
  }

  async create(createDto: CreateDto, userId: string): Promise<ResponseDto> {
    try {
      const item = new this.model({
        ...createDto,
        createdBy: userId,
        updatedBy: userId,
      });

      const savedItem = await item.save();
      return this.toResponseDto(savedItem);
    } catch (error) {
      this.logger.error(`Failed to create item: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create item');
    }
  }

  async update(
    id: string,
    updateDto: UpdateDto,
    userId: string,
  ): Promise<ResponseDto> {
    const item = await this.model.findOne({ _id: id, deletedAt: null }).exec();

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    const updates = {
      ...updateDto,
      updatedBy: userId,
    };

    const updatedItem = await this.model
      .findByIdAndUpdate(id, updates, { new: true })
      .lean()
      .exec();

    return this.toResponseDto(updatedItem);
  }

  async softDelete(
    id: string,
    userId: string,
  ): Promise<{ message: string; item: ResponseDto }> {
    const item = await this.model.findOne({ _id: id, deletedAt: null }).exec();

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    const softDeletedItem = await this.model
      .findByIdAndUpdate(
        id,
        {
          deletedAt: new Date(),
          deletedBy: userId,
        },
        { new: true },
      )
      .lean()
      .exec();

    return {
      message: `Item has been marked as deleted`,
      item: this.toResponseDto(softDeletedItem),
    };
  }

  async restore(id: string, userId: string): Promise<ResponseDto> {
    const item = await this.model
      .findOne({ _id: id, deletedAt: { $ne: null } })
      .exec();

    if (!item) {
      throw new NotFoundException(`Item not found or is not deleted`);
    }

    const restoredItem = await this.model
      .findByIdAndUpdate(
        id,
        {
          deletedAt: null,
          deletedBy: null,
          updatedBy: userId,
        },
        { new: true },
      )
      .lean()
      .exec();

    return this.toResponseDto(restoredItem);
  }

  async hardDelete(id: string): Promise<{ message: string }> {
    const item = await this.model.findById(id).exec();

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    await this.model.findByIdAndDelete(id).exec();

    return {
      message: 'Item permanently deleted',
    };
  }

  // Abstract method to be implemented by subclasses
  protected abstract toResponseDto(entity: any): ResponseDto;
}
