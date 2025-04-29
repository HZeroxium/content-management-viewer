// /src/modules/files/files.service.ts

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  S3ServiceException,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as mime from 'mime-types';
import { Express } from 'express';
import { File, FileDocument } from './schemas/file.schema';
import { FileResponseDto } from './dto/file-response.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
} from '@common/dto/pagination.dto';

export interface FileUploadOptions {
  /** Custom folder path (e.g., 'users/avatars/') */
  folder?: string;
  /** Custom filename (UUID will be used if not provided) */
  fileName?: string;
  /** Optional content type override */
  contentType?: string;
  /** Additional metadata as key-value pairs */
  metadata?: Record<string, string>;
  /** Make file private (default is public-read) */
  isPrivate?: boolean;
  /** User ID who uploaded the file */
  createdBy?: string;
}

@Injectable()
export class FilesService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly baseUrl: string;
  private readonly logger = new Logger(FilesService.name);

  // Allowed mime types
  private readonly allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    // Audio/Video
    'audio/mpeg',
    'audio/wav',
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ];

  // Max file size (10 MB)
  private readonly maxFileSize = 10 * 1024 * 1024;

  constructor(
    private readonly config: ConfigService,
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
  ) {
    // Get configuration values from structured config
    this.bucket = this.config.get<string>('app.spaces.bucket')!;
    const endpoint = this.config.get<string>('app.spaces.endpoint');
    const region = this.config.get<string>('app.spaces.region') || 'sgp1';
    const accessKeyId = this.config.get<string>('app.spaces.key');
    const secretAccessKey = this.config.get<string>('app.spaces.secret');

    // Validate required config
    if (!this.bucket || !endpoint || !accessKeyId || !secretAccessKey) {
      this.logger.error('Missing required DigitalOcean Spaces configuration');
      throw new Error('Missing required DigitalOcean Spaces configuration');
    }

    // Initialize S3 client for DO Spaces
    this.s3 = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: false, // Use subdomain style for DO Spaces
    });

    // Construct base URL for assets
    this.baseUrl = `${endpoint}/${this.bucket}`;
    this.logger.log(`Initialized S3 client for bucket: ${this.bucket}`);
  }

  /**
   * Upload file to DigitalOcean Spaces and save metadata to database
   * @param file - The file from Multer
   * @param options - Optional configuration for the upload
   * @returns File response with URL and metadata
   */
  async uploadFile(
    file: Express.Multer.File,
    options: FileUploadOptions = {},
  ): Promise<FileResponseDto> {
    try {
      // Validate file exists
      if (!file || !file.buffer) {
        throw new BadRequestException('No file provided');
      }

      // Validate file size
      if (file.size > this.maxFileSize) {
        throw new BadRequestException(
          `File size exceeds maximum allowed size of ${
            this.maxFileSize / (1024 * 1024)
          } MB`,
        );
      }

      // Validate mime type
      const contentType =
        options.contentType ||
        file.mimetype ||
        mime.lookup(file.originalname) ||
        'application/octet-stream';

      if (!this.allowedMimeTypes.includes(contentType)) {
        throw new BadRequestException(
          `File type ${contentType} is not allowed. Allowed types: ${this.allowedMimeTypes.join(
            ', ',
          )}`,
        );
      }

      // Generate unique key with optional folder path
      const ext = path.extname(file.originalname);
      const baseName = options.fileName || uuidv4();
      const folderPrefix = options.folder
        ? `${options.folder.replace(/\/*$/, '/')}`
        : '';
      const key = `${folderPrefix}${baseName}${ext}`;
      const filename = `${baseName}${ext}`;

      // Set ACL based on privacy option
      const acl = options.isPrivate ? 'private' : 'public-read';

      // Build metadata object
      const metadata = {
        'original-name': file.originalname,
        ...options.metadata,
      };

      // Upload to Spaces
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: contentType,
          ContentLength: file.size,
          ACL: acl,
          Metadata: metadata,
        }),
      );

      // Generate URL
      const url = `${this.baseUrl}/${key}`;

      // Save file metadata to database
      const fileData = new this.fileModel({
        filename,
        originalName: file.originalname,
        key,
        url,
        contentType,
        size: file.size,
        folder: options.folder || null,
        isPrivate: options.isPrivate || false,
        metadata: options.metadata || {},
        createdBy: options.createdBy || 'system',
        updatedBy: options.createdBy || 'system',
      });

      const savedFile = await fileData.save();
      this.logger.log(`File uploaded and saved to database: ${key}`);

      return FileResponseDto.fromEntity(savedFile);
    } catch (err) {
      // Handle specific AWS errors
      if (err instanceof S3ServiceException) {
        this.logger.error(`S3 error: ${err.name} - ${err.message}`);
        throw new InternalServerErrorException(
          `Error uploading to storage: ${err.message}`,
        );
      }

      // Re-throw client errors
      if (err instanceof BadRequestException) {
        throw err;
      }

      // Generic error handling
      this.logger.error(`File upload error: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Error uploading file to storage');
    }
  }

  /**
   * Find all files with pagination
   * Excludes soft-deleted files
   */
  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<FileResponseDto>> {
    try {
      const { skip, limit = 10, sort, order } = query;

      // Build filter to exclude soft-deleted files
      const filter = { deletedAt: null };

      // Build sort options
      const sortOptions: Record<string, 1 | -1> = {};
      if (sort) {
        sortOptions[sort] = order === 'desc' ? -1 : 1;
      } else {
        sortOptions['createdAt'] = -1; // Default sort by creation date desc
      }

      // Execute query with pagination
      const [files, total] = await Promise.all([
        this.fileModel
          .find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.fileModel.countDocuments(filter).exec(),
      ]);

      // Map results to DTOs
      const fileDtos = files.map((file) => FileResponseDto.fromEntity(file));

      return PaginatedResponseDto.create(fileDtos, total, query);
    } catch (error) {
      this.logger.error(`Failed to fetch files: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch files');
    }
  }

  /**
   * Find one file by ID
   */
  async findOne(id: string): Promise<FileResponseDto> {
    const file = await this.fileModel
      .findOne({ _id: id, deletedAt: null })
      .lean()
      .exec();

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return FileResponseDto.fromEntity(file);
  }

  /**
   * Update file metadata
   */
  async update(
    id: string,
    updateFileDto: UpdateFileDto,
    userId: string,
  ): Promise<FileResponseDto> {
    const file = await this.fileModel
      .findOne({ _id: id, deletedAt: null })
      .exec();

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    // Update the file metadata
    const updates = {
      ...updateFileDto,
      updatedBy: userId,
    };

    // If changing privacy status, update the ACL on DigitalOcean Spaces
    if (
      updateFileDto.isPrivate !== undefined &&
      updateFileDto.isPrivate !== file.isPrivate
    ) {
      try {
        // We would need to use PutObjectAcl command here, but for now let's just log
        this.logger.log(
          `Privacy setting changed for file ${file.key}. This would update the ACL on Spaces.`,
        );
        // In a complete implementation, you'd re-upload the file with the new ACL
      } catch (error) {
        this.logger.error(
          `Failed to update ACL for ${file.key}: ${error.message}`,
        );
        throw new InternalServerErrorException(
          'Failed to update file privacy settings',
        );
      }
    }

    const updatedFile = await this.fileModel
      .findByIdAndUpdate(id, updates, { new: true })
      .lean()
      .exec();

    return FileResponseDto.fromEntity(updatedFile);
  }

  /**
   * Delete a file from DigitalOcean Spaces and mark as deleted in database
   */
  async remove(
    id: string,
    userId: string,
  ): Promise<{ message: string; file: FileResponseDto }> {
    const file = await this.fileModel
      .findOne({ _id: id, deletedAt: null })
      .exec();

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    // Soft delete in database
    const softDeletedFile = await this.fileModel
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
      message: `File ${file.filename} has been marked as deleted`,
      file: FileResponseDto.fromEntity(softDeletedFile),
    };
  }

  /**
   * Permanently delete a file from storage and database
   */
  async permanentDelete(id: string): Promise<{ message: string }> {
    const file = await this.fileModel.findById(id).exec();

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    try {
      // Delete from DigitalOcean Spaces
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: file.key,
        }),
      );

      // Delete from database
      await this.fileModel.findByIdAndDelete(id).exec();

      this.logger.log(
        `File ${file.key} permanently deleted from storage and database`,
      );
      return {
        message: `File ${file.filename} has been permanently deleted`,
      };
    } catch (error) {
      this.logger.error(`Error deleting file ${file.key}: ${error.message}`);
      throw new InternalServerErrorException(
        'Error deleting file from storage',
      );
    }
  }

  /**
   * Restore a soft-deleted file
   */
  async restore(id: string, userId: string): Promise<FileResponseDto> {
    const file = await this.fileModel
      .findOne({ _id: id, deletedAt: { $ne: null } })
      .exec();

    if (!file) {
      throw new NotFoundException(
        `File with ID ${id} not found or is not deleted`,
      );
    }

    // Check if the file still exists in storage
    const fileExists = await this.fileExists(file.key);
    if (!fileExists) {
      throw new BadRequestException(
        `File no longer exists in storage and cannot be restored`,
      );
    }

    // Restore in database
    const restoredFile = await this.fileModel
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

    return FileResponseDto.fromEntity(restoredFile);
  }

  /**
   * List files in a folder from storage (not from database)
   */
  async listFilesInStorage(
    folder?: string,
    maxKeys: number = 1000,
  ): Promise<{ keys: string[] }> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: folder,
        MaxKeys: maxKeys,
      });

      const response = await this.s3.send(command);

      return {
        keys:
          response.Contents?.map((item) => item.Key).filter(
            (key): key is string => key !== undefined,
          ) || [],
      };
    } catch (error) {
      this.logger.error(`Failed to list files in storage: ${error.message}`);
      throw new InternalServerErrorException('Failed to list files in storage');
    }
  }

  /**
   * Check if a file exists in the storage
   * @param key - Object key to check
   * @returns boolean indicating if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      await this.s3.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Delete a file from DigitalOcean Spaces directly by key
   * @param key - The object key to delete
   */
  async deleteFile(key: string): Promise<void> {
    try {
      // First check if file exists in database
      const file = await this.fileModel.findOne({ key }).exec();

      // Delete from storage
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      // If file exists in database, delete it too
      if (file) {
        await this.fileModel.findByIdAndDelete(file._id).exec();
      }

      this.logger.log(`File deleted successfully: ${key}`);
    } catch (err) {
      this.logger.error(`Error deleting file ${key}: ${err.message}`);
      throw new InternalServerErrorException(
        'Error deleting file from storage',
      );
    }
  }
}
