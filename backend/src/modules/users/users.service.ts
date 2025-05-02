// /src/modules/users/users.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { hash, compare } from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
} from '@common/dto/pagination.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /** Create a new user, hashing password, setting audit fields */
  async create(dto: CreateUserDto, createdBy: string): Promise<User> {
    // Generate a default name if one isn't provided
    const userData = {
      ...dto,
      name: dto.name || `User-${randomUUID().substring(0, 8)}`,
      createdBy,
      updatedBy: createdBy,
    };

    const created = new this.userModel(userData);
    return created.save();
  }

  /**
   * Find all users with pagination (admin-only)
   * @deprecated Use findAllPaginated instead
   */
  findAll(): Promise<User[]> {
    return this.userModel
      .find({ deletedAt: null })
      .select('-password')
      .lean()
      .exec();
  }

  /**
   * Find all users with pagination support
   * Excludes soft-deleted users by default
   */
  async findAllPaginated(
    query: PaginationQueryDto,
    includeDeleted = false,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const { skip, limit = 10, sort, order } = query;

    // Build filter to exclude soft-deleted users unless specified
    const filter = includeDeleted ? {} : { deletedAt: null };

    // Build sort options
    const sortOptions: Record<string, 1 | -1> = {};
    if (sort) {
      sortOptions[sort] = order === 'desc' ? -1 : 1;
    } else {
      // Default sort by createdAt descending if no sort specified
      sortOptions['createdAt'] = -1;
    }

    // Execute query with pagination
    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .select('-password')
        .lean()
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    // Map results to DTOs
    const userDtos = users.map((user) => UserResponseDto.fromEntity(user));

    // Return paginated response
    return PaginatedResponseDto.create(userDtos, total, query);
  }

  /**
   * Find only deleted users with pagination
   */
  async findDeletedPaginated(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const { skip, limit = 10, sort, order } = query;

    // Build filter to only include soft-deleted users
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
    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .select('-password')
        .lean()
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    // Map results to DTOs
    const userDtos = users.map((user) => UserResponseDto.fromEntity(user));

    // Return paginated response
    return PaginatedResponseDto.create(userDtos, total, query);
  }

  /**
   * Find one by ID, throw if not found
   * Excludes soft-deleted users by default
   */
  async findOne(id: string, includeDeleted = false): Promise<User> {
    const filter = includeDeleted ? { _id: id } : { _id: id, deletedAt: null };

    const user = await this.userModel
      .findOne(filter)
      .select('-password')
      .lean()
      .exec();

    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  /** Update fields; re-hash password if provided, update audit */
  async update(
    id: string,
    dto: UpdateUserDto,
    updatedBy: string,
  ): Promise<User> {
    const update: Partial<UpdateUserDto & { updatedBy: string }> = {
      ...dto,
      updatedBy,
    };
    if (dto.password) {
      update.password = await hash(dto.password, 10);
    }
    const user = await this.userModel
      .findOneAndUpdate({ _id: id, deletedAt: null }, update, { new: true })
      .select('-password')
      .lean()
      .exec();
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  /**
   * Soft delete user by ID
   * Sets deletedAt timestamp and deletedBy
   * @returns The soft-deleted user details
   */
  async remove(id: string, deletedBy: string): Promise<UserResponseDto> {
    const user = await this.userModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date(), deletedBy },
        { new: true },
      )
      .lean()
      .exec();

    if (!user) throw new NotFoundException(`User ${id} not found`);
    return UserResponseDto.fromEntity(user);
  }

  /**
   * Restore a soft-deleted user
   * Clears deletedAt and deletedBy fields
   */
  async restore(id: string, restoredBy: string): Promise<User> {
    const user = await this.userModel
      .findOneAndUpdate(
        { _id: id, deletedAt: { $ne: null } },
        { deletedAt: null, deletedBy: null, updatedBy: restoredBy },
        { new: true },
      )
      .select('-password')
      .lean()
      .exec();

    if (!user)
      throw new NotFoundException(`User ${id} not found or already active`);
    return user;
  }

  /**
   * Permanently delete a user (hard delete)
   * For administrative purposes only
   * @returns Deletion result with user ID and status
   */
  async permanentDelete(
    id: string,
  ): Promise<{ id: string; deleted: boolean; message: string }> {
    const user = await this.userModel.findById(id).lean().exec();
    if (!user) throw new NotFoundException(`User ${id} not found`);

    const userName = user.name;
    const userEmail = user.email;

    const res = await this.userModel.findByIdAndDelete(id).exec();

    return {
      id,
      deleted: !!res,
      message: `User "${userName}" (${userEmail}) has been permanently deleted`,
    };
  }

  /** Used by AuthService to check credentials */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email, deletedAt: null }).exec();
  }

  /** Compare plain text to hashed */
  async verifyPassword(user: UserDocument, plain: string): Promise<boolean> {
    return compare(plain, user.password);
  }
}
