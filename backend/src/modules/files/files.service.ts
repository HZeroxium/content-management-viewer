// /src/modules/files/files.service.ts

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as mime from 'mime-types';
import { S3ServiceException } from '@aws-sdk/client-s3';

import { File, FileDocument } from './schemas/file.schema';
import { FileResponseDto } from './dto/file-response.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { BaseCrudService } from '@common/services/base-crud.service';
import { S3StorageService } from '@common/services/storage.service';
import { FileValidatorService } from './services/file-validator.service';

export interface FileUploadOptions {
  folder?: string;
  fileName?: string;
  contentType?: string;
  metadata?: Record<string, string>;
  isPrivate?: boolean;
  createdBy?: string;
}

@Injectable()
export class FilesService extends BaseCrudService<
  FileDocument,
  any, // We have a custom create method
  UpdateFileDto,
  FileResponseDto
> {
  protected readonly logger = new Logger(FilesService.name);

  constructor(
    @InjectModel(File.name) protected readonly model: Model<FileDocument>,
    private readonly storageService: S3StorageService,
    private readonly fileValidator: FileValidatorService,
  ) {
    super();
  }

  protected toResponseDto(entity: any): FileResponseDto {
    return FileResponseDto.fromEntity(entity);
  }

  /**
   * Upload file to storage and save metadata to database
   */
  async uploadFile(
    file: Express.Multer.File,
    options: FileUploadOptions = {},
  ): Promise<FileResponseDto> {
    try {
      // Validate the file
      this.fileValidator.validateFile(file);

      // Generate unique key and filename
      const ext = path.extname(file.originalname);
      const baseName = options.fileName || uuidv4();
      const folderPrefix = options.folder
        ? `${options.folder.replace(/\/*$/, '/')}`
        : '';
      const key = `${folderPrefix}${baseName}${ext}`;
      const filename = `${baseName}${ext}`;

      // Determine content type
      const contentType =
        options.contentType ||
        file.mimetype ||
        mime.lookup(file.originalname) ||
        'application/octet-stream';

      // Prepare metadata
      const metadata = {
        'original-name': file.originalname,
        ...options.metadata,
      };

      // Upload to storage
      const url = await this.storageService.upload(file, {
        key,
        contentType,
        isPrivate: options.isPrivate,
        metadata,
      });

      // Save file metadata to database
      const fileData = new this.model({
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

      return this.toResponseDto(savedFile);
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
   * Custom implementation of soft delete for files
   */
  async remove(
    id: string,
    userId: string,
  ): Promise<{ message: string; file: FileResponseDto }> {
    const result = await this.softDelete(id, userId);
    return {
      message: `File has been marked as deleted`,
      file: result.item,
    };
  }

  /**
   * Permanently delete a file from storage and database
   */
  async permanentDelete(id: string): Promise<{ message: string }> {
    const file = await this.model.findById(id).exec();

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    try {
      // Delete from storage first
      await this.storageService.delete(file.key);

      // Then delete from database
      await this.model.findByIdAndDelete(id).exec();

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
   * Override restore to check if file still exists in storage
   */
  async restore(id: string, userId: string): Promise<FileResponseDto> {
    const file = await this.model
      .findOne({ _id: id, deletedAt: { $ne: null } })
      .exec();

    if (!file) {
      throw new NotFoundException(
        `File with ID ${id} not found or is not deleted`,
      );
    }

    // Check if the file still exists in storage
    const fileExists = await this.storageService.exists(file.key);
    if (!fileExists) {
      throw new BadRequestException(
        `File no longer exists in storage and cannot be restored`,
      );
    }

    return super.restore(id, userId);
  }

  /**
   * List files in storage (not from database)
   */
  async listFilesInStorage(
    folder?: string,
    maxKeys: number = 1000,
  ): Promise<{ keys: string[] }> {
    try {
      return await this.storageService.list(folder, maxKeys);
    } catch (error) {
      this.logger.error(`Failed to list files in storage: ${error.message}`);
      throw new InternalServerErrorException('Failed to list files in storage');
    }
  }

  /**
   * Delete a file from storage by key
   */
  async deleteFile(key: string): Promise<void> {
    try {
      // Check if file exists in database
      const file = await this.model.findOne({ key }).exec();

      // Delete from storage
      await this.storageService.delete(key);

      // If file exists in database, delete it too
      if (file) {
        await this.model.findByIdAndDelete(file._id).exec();
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
