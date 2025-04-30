// /src/modules/files/services/file-validator.service.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import * as mime from 'mime-types';

@Injectable()
export class FileValidatorService {
  // Allowed mime types - can be configured via DI
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

  // Max file size (10 MB by default)
  private readonly maxFileSize = 10 * 1024 * 1024;

  validateFile(
    file: Express.Multer.File,
    options?: { customTypes?: string[]; maxSize?: number },
  ): void {
    // Validate file exists
    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided');
    }

    // Get max size from options or use default
    const maxSize = options?.maxSize || this.maxFileSize;

    // Validate file size
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)} MB`,
      );
    }

    // Determine mime type
    const contentType =
      file.mimetype ||
      mime.lookup(file.originalname) ||
      'application/octet-stream';

    // Use custom types if provided, otherwise use default list
    const typesToCheck = options?.customTypes || this.allowedMimeTypes;

    // Validate mime type
    if (!typesToCheck.includes(contentType)) {
      throw new BadRequestException(
        `File type ${contentType} is not allowed. Allowed types: ${typesToCheck.join(', ')}`,
      );
    }
  }
}
