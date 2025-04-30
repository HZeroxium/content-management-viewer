// /src/common/services/storage.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3ServiceException,
} from '@aws-sdk/client-s3';

// Interface for storage operations
export interface StorageServiceFacade {
  upload(
    file: Express.Multer.File,
    options: StorageUploadOptions,
  ): Promise<string>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  list(folder?: string, maxKeys?: number): Promise<{ keys: string[] }>;
}

export interface StorageUploadOptions {
  key: string;
  contentType: string;
  isPrivate?: boolean;
  metadata?: Record<string, string>;
}

@Injectable()
export class S3StorageService implements StorageServiceFacade {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly baseUrl: string;
  private readonly logger = new Logger(S3StorageService.name);

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('app.spaces.bucket')!;
    const endpoint = this.config.get<string>('app.spaces.endpoint');
    const region = this.config.get<string>('app.spaces.region') || 'sgp1';
    const accessKeyId = this.config.get<string>('app.spaces.key');
    const secretAccessKey = this.config.get<string>('app.spaces.secret');

    // Validate required config
    if (!this.bucket || !endpoint || !accessKeyId || !secretAccessKey) {
      this.logger.error('Missing required storage configuration');
      throw new Error('Missing required storage configuration');
    }

    // Initialize S3 client
    this.s3 = new S3Client({
      region,
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: false,
    });

    this.baseUrl = `${endpoint}/${this.bucket}`;
  }

  async upload(
    file: Express.Multer.File,
    options: StorageUploadOptions,
  ): Promise<string> {
    // Set ACL based on privacy option
    const acl = options.isPrivate ? 'private' : 'public-read';

    // Upload to S3
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: options.key,
        Body: file.buffer,
        ContentType: options.contentType,
        ContentLength: file.size,
        ACL: acl,
        Metadata: options.metadata,
      }),
    );

    // Return the full URL
    return `${this.baseUrl}/${options.key}`;
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async exists(key: string): Promise<boolean> {
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

  async list(
    folder?: string,
    maxKeys: number = 1000,
  ): Promise<{ keys: string[] }> {
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
  }
}
