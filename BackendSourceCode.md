# Backend Source Code Documentation
> Generated on 2025-05-01 21:18:54

This document contains the source code from \$srcPath\.

## Table of Contents
- [1. D:\Projects\Desktop\content-management\backend\src\app.module.ts](#file-1)
- [2. D:\Projects\Desktop\content-management\backend\src\main.ts](#file-2)
- [3. D:\Projects\Desktop\content-management\backend\src\common\cache\cache.module.ts](#file-3)
- [4. D:\Projects\Desktop\content-management\backend\src\common\cache\cache.service.ts](#file-4)
- [5. D:\Projects\Desktop\content-management\backend\src\common\decorators\public.decorator.ts](#file-5)
- [6. D:\Projects\Desktop\content-management\backend\src\common\decorators\roles.decorator.ts](#file-6)
- [7. D:\Projects\Desktop\content-management\backend\src\common\dto\pagination.dto.ts](#file-7)
- [8. D:\Projects\Desktop\content-management\backend\src\common\filters\http-exception.filter.ts](#file-8)
- [9. D:\Projects\Desktop\content-management\backend\src\common\guards\roles.guard.ts](#file-9)
- [10. D:\Projects\Desktop\content-management\backend\src\common\interceptors\logging.interceptor.ts](#file-10)
- [11. D:\Projects\Desktop\content-management\backend\src\common\pipes\validation.pipe.ts](#file-11)
- [12. D:\Projects\Desktop\content-management\backend\src\common\services\base-crud.service.ts](#file-12)
- [13. D:\Projects\Desktop\content-management\backend\src\common\services\storage.service.ts](#file-13)
- [14. D:\Projects\Desktop\content-management\backend\src\common\services\transaction.service.ts](#file-14)
- [15. D:\Projects\Desktop\content-management\backend\src\config\configuration.ts](#file-15)
- [16. D:\Projects\Desktop\content-management\backend\src\config\env.validation.ts](#file-16)
- [17. D:\Projects\Desktop\content-management\backend\src\modules\auth\auth.controller.ts](#file-17)
- [18. D:\Projects\Desktop\content-management\backend\src\modules\auth\auth.module.ts](#file-18)
- [19. D:\Projects\Desktop\content-management\backend\src\modules\auth\auth.service.ts](#file-19)
- [20. D:\Projects\Desktop\content-management\backend\src\modules\auth\dto\change-password.dto.ts](#file-20)
- [21. D:\Projects\Desktop\content-management\backend\src\modules\auth\dto\login.dto.ts](#file-21)
- [22. D:\Projects\Desktop\content-management\backend\src\modules\auth\dto\register.dto.ts](#file-22)
- [23. D:\Projects\Desktop\content-management\backend\src\modules\auth\guards\jwt-auth.guard.ts](#file-23)
- [24. D:\Projects\Desktop\content-management\backend\src\modules\auth\guards\local-auth.guard.ts](#file-24)
- [25. D:\Projects\Desktop\content-management\backend\src\modules\auth\strategies\jwt.strategy.ts](#file-25)
- [26. D:\Projects\Desktop\content-management\backend\src\modules\auth\strategies\local.strategy.ts](#file-26)
- [27. D:\Projects\Desktop\content-management\backend\src\modules\content\content.controller.ts](#file-27)
- [28. D:\Projects\Desktop\content-management\backend\src\modules\content\content.module.ts](#file-28)
- [29. D:\Projects\Desktop\content-management\backend\src\modules\content\content.service.ts](#file-29)
- [30. D:\Projects\Desktop\content-management\backend\src\modules\content\dto\content-response.dto.ts](#file-30)
- [31. D:\Projects\Desktop\content-management\backend\src\modules\content\dto\create-content-with-blocks.dto.ts](#file-31)
- [32. D:\Projects\Desktop\content-management\backend\src\modules\content\dto\create-content.dto.ts](#file-32)
- [33. D:\Projects\Desktop\content-management\backend\src\modules\content\dto\update-content.dto.ts](#file-33)
- [34. D:\Projects\Desktop\content-management\backend\src\modules\content\schemas\content.schema.ts](#file-34)
- [35. D:\Projects\Desktop\content-management\backend\src\modules\content\services\content-processor.service.ts](#file-35)
- [36. D:\Projects\Desktop\content-management\backend\src\modules\files\files.controller.ts](#file-36)
- [37. D:\Projects\Desktop\content-management\backend\src\modules\files\files.module.ts](#file-37)
- [38. D:\Projects\Desktop\content-management\backend\src\modules\files\files.service.ts](#file-38)
- [39. D:\Projects\Desktop\content-management\backend\src\modules\files\dto\file-response.dto.ts](#file-39)
- [40. D:\Projects\Desktop\content-management\backend\src\modules\files\dto\update-file.dto.ts](#file-40)
- [41. D:\Projects\Desktop\content-management\backend\src\modules\files\dto\upload-file.dto.ts](#file-41)
- [42. D:\Projects\Desktop\content-management\backend\src\modules\files\schemas\file.schema.ts](#file-42)
- [43. D:\Projects\Desktop\content-management\backend\src\modules\files\services\file-validator.service.ts](#file-43)
- [44. D:\Projects\Desktop\content-management\backend\src\modules\users\users.controller.ts](#file-44)
- [45. D:\Projects\Desktop\content-management\backend\src\modules\users\users.module.ts](#file-45)
- [46. D:\Projects\Desktop\content-management\backend\src\modules\users\users.service.ts](#file-46)
- [47. D:\Projects\Desktop\content-management\backend\src\modules\users\dto\create-user.dto.ts](#file-47)
- [48. D:\Projects\Desktop\content-management\backend\src\modules\users\dto\update-user.dto.ts](#file-48)
- [49. D:\Projects\Desktop\content-management\backend\src\modules\users\dto\user-response.dto.ts](#file-49)
- [50. D:\Projects\Desktop\content-management\backend\src\modules\users\schemas\user.schema.ts](#file-50)
- [51. D:\Projects\Desktop\content-management\backend\src\websocket\content.gateway.ts](#file-51)

<a id="file-1"></a>
## 1. D:\Projects\Desktop\content-management\backend\src\app.module.ts

**File Size:** 1.33 KB | **Last Modified:** 04/29/2025 22:20:48

\\\$language
// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { environmentValidationSchema } from './config/env.validation';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from './common/cache/cache.module';
import { ContentGateway } from './websocket/content.gateway';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ContentModule } from './modules/content/content.module';
import { FilesModule } from './modules/files/files.module';

@Module({
  imports: [
    // 1) Load and validate .env
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: environmentValidationSchema,
    }),

    // 2) Now you can use ConfigService in any module
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('app.mongo.uri'),
        // you can add options here
      }),
      inject: [ConfigService],
    }),

    // Core modules
    CacheModule,
    UsersModule,
    AuthModule,
    ContentModule,
    FilesModule,
  ],
  providers: [ContentGateway],
})
export class AppModule {}
```

<a id="file-2"></a>
## 2. D:\Projects\Desktop\content-management\backend\src\main.ts

**File Size:** 0.82 KB | **Last Modified:** 05/01/2025 15:53:28

\\\$language
// /src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@common/pipes/validation.pipe';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1) Global validation
  app.useGlobalPipes(ValidationPipe);

  // 2) Global error filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // 3) Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

<a id="file-3"></a>
## 3. D:\Projects\Desktop\content-management\backend\src\common\cache\cache.module.ts

**File Size:** 0.3 KB | **Last Modified:** 04/29/2025 16:25:29

\\\$language
// src/common/cache/cache.module.ts

import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';

@Global() // makes CacheService injectable application-wide
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
```

<a id="file-4"></a>
## 4. D:\Projects\Desktop\content-management\backend\src\common\cache\cache.service.ts

**File Size:** 1.53 KB | **Last Modified:** 04/29/2025 16:25:32

\\\$language
// src/common/cache/cache.service.ts

import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Redis as RedisClient } from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: RedisClient;

  constructor(private readonly config: ConfigService) {
    // Initialize ioredis with host/port from ConfigService
    this.client = new Redis({
      host: this.config.get<string>('app.redis.host'),
      port: this.config.get<number>('app.redis.port'),
      // you can add password, tls, etc. here if needed
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis error', err);
    });
  }

  /** Set a key with optional TTL (seconds). */
  async set(key: string, value: any, ttlSeconds?: number): Promise<'OK'> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      return this.client.set(key, serialized, 'EX', ttlSeconds);
    }
    return this.client.set(key, serialized);
  }

  /** Get a typed value (or null). */
  async get<T = any>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  /** Delete one or more keys. */
  async del(...keys: string[]): Promise<number> {
    return this.client.del(...keys);
  }

  /** Clean up on shutdown. */
  async onModuleDestroy() {
    await this.client.quit();
  }
}
```

<a id="file-5"></a>
## 5. D:\Projects\Desktop\content-management\backend\src\common\decorators\public.decorator.ts

**File Size:** 0.34 KB | **Last Modified:** 04/29/2025 16:02:54

\\\$language
// /src/common/decorators/public.decorator.ts

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route as public, bypassing JWT authentication
 * @example
 * @Public()
 * @Get('health')
 * healthCheck() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

<a id="file-6"></a>
## 6. D:\Projects\Desktop\content-management\backend\src\common\decorators\roles.decorator.ts

**File Size:** 0.32 KB | **Last Modified:** 04/29/2025 16:25:24

\\\$language
// src/common/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';

export type Role = 'admin' | 'editor' | 'client';

/**
 * @Roles('admin','editor')
 * Attaches an array of allowed roles to the route’s metadata.
 */
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
```

<a id="file-7"></a>
## 7. D:\Projects\Desktop\content-management\backend\src\common\dto\pagination.dto.ts

**File Size:** 1.36 KB | **Last Modified:** 04/29/2025 19:48:00

\\\$language
// /src/common/dto/pagination.dto.ts

import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * Standard pagination query parameters
 */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'asc';

  // Calculate skip for MongoDB
  get skip(): number {
    return ((this.page ?? 1) - 1) * (this.limit ?? 10);
  }
}

/**
 * Standard paginated response format
 * @template T - The type of items in the data array
 */
export class PaginatedResponseDto<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };

  /**
   * Create a paginated response from data and count
   */
  static create<T>(
    data: T[],
    total: number,
    query: PaginationQueryDto,
  ): PaginatedResponseDto<T> {
    const { page, limit } = query;
    const pages = Math.ceil(total / (limit ?? 10));

    return {
      data,
      meta: {
        total,
        page: page ?? 1,
        limit: limit ?? 10,
        pages,
      },
    };
  }
}
```

<a id="file-8"></a>
## 8. D:\Projects\Desktop\content-management\backend\src\common\filters\http-exception.filter.ts

**File Size:** 1.11 KB | **Last Modified:** 04/29/2025 15:42:46

\\\$language
// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Catches all HttpExceptions and formats the response JSON as:
 * {
 *   statusCode: number,
 *   timestamp: string,
 *   path: string,
 *   error: string | record
 * }
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = exception.getResponse();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      // payload may be string or object with message/details
      error: typeof payload === 'string' ? payload : (payload as any).message,
    });
  }
}
```

<a id="file-9"></a>
## 9. D:\Projects\Desktop\content-management\backend\src\common\guards\roles.guard.ts

**File Size:** 1.15 KB | **Last Modified:** 04/29/2025 15:42:51

\\\$language
// src/common/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Read required roles from metadata (if none, allow)
    const requiredRoles = this.reflector.get<Role[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 2. Get user (populated by JwtStrategy) from request
    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException('No user role found');
    }

    // 3. Check if user.role is in requiredRoles
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Role "${user.role}" not authorized. Requires: ${requiredRoles.join(
          ', ',
        )}`,
      );
    }

    return true;
  }
}
```

<a id="file-10"></a>
## 10. D:\Projects\Desktop\content-management\backend\src\common\interceptors\logging.interceptor.ts

**File Size:** 0.89 KB | **Last Modified:** 04/29/2025 15:23:44

\\\$language
// src/common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

/**
 * Logs each incoming request:
 * [METHOD] URL → statusCode in Xms
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const statusCode = res.statusCode;
        const ms = Date.now() - now;
        this.logger.log(`${method} ${url} → ${statusCode} in ${ms}ms`);
      }),
    );
  }
}
```

<a id="file-11"></a>
## 11. D:\Projects\Desktop\content-management\backend\src\common\pipes\validation.pipe.ts

**File Size:** 0.48 KB | **Last Modified:** 04/29/2025 15:23:22

\\\$language
// src/common/pipes/validation.pipe.ts
import { ValidationPipe as NestValidationPipe } from '@nestjs/common';

/**
 * Global validation pipe:
 * - whitelist: strips any properties not in the DTO
 * - forbidNonWhitelisted: throws error if extra props are provided
 * - transform: auto-converts payloads to DTO instances (e.g., string → number)
 */
export const ValidationPipe = new NestValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});
```

<a id="file-12"></a>
## 12. D:\Projects\Desktop\content-management\backend\src\common\services\base-crud.service.ts

**File Size:** 4.6 KB | **Last Modified:** 04/30/2025 23:08:53

\\\$language
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
```

<a id="file-13"></a>
## 13. D:\Projects\Desktop\content-management\backend\src\common\services\storage.service.ts

**File Size:** 3.41 KB | **Last Modified:** 04/30/2025 23:08:59

\\\$language
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
```

<a id="file-14"></a>
## 14. D:\Projects\Desktop\content-management\backend\src\common\services\transaction.service.ts

**File Size:** 3.67 KB | **Last Modified:** 04/30/2025 23:09:05

\\\$language
// /src/common/services/transaction.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ClientSession } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface TransactionContext {
  session: ClientSession | null;
  transactionId: string;
  useTransaction: boolean;
}

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(@InjectConnection() private connection: Connection) {}

  /**
   * Creates a new transaction context with optional MongoDB session
   */
  async createContext(): Promise<TransactionContext> {
    const transactionId = uuidv4();
    let session: ClientSession | null = null;
    let useTransaction = false;

    try {
      // Check for replica set support
      const admin = this.connection.db?.admin();
      if (!admin) {
        throw new Error('Database connection not available');
      }

      const isMaster = await admin.command({ isMaster: 1 });
      if (isMaster.setName) {
        // Replica set detected → enable transactions
        session = await this.connection.startSession();
        session.startTransaction();
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
      this.logger.log(
        `[${transactionId}] Could not check replica set status (proceeding without transactions): ${checkErr.message}`,
      );
    }

    return {
      session,
      transactionId,
      useTransaction,
    };
  }

  /**
   * Commits a transaction if it's active
   */
  async commitTransaction(context: TransactionContext): Promise<void> {
    if (context.useTransaction && context.session) {
      await context.session.commitTransaction();
      this.logger.log(
        `[${context.transactionId}] Transaction committed successfully.`,
      );
    }
  }

  /**
   * Aborts a transaction if it's active
   */
  async abortTransaction(context: TransactionContext): Promise<void> {
    if (context.useTransaction && context.session) {
      try {
        await context.session.abortTransaction();
        this.logger.log(`[${context.transactionId}] Transaction aborted.`);
      } catch (abortErr) {
        this.logger.error(
          `[${context.transactionId}] Failed to abort transaction: ${abortErr.message}`,
        );
      }
    }
  }

  /**
   * Ends the session if it exists
   */
  async endSession(context: TransactionContext): Promise<void> {
    if (context.session) {
      try {
        await context.session.endSession();
      } catch (endErr) {
        this.logger.error(
          `[${context.transactionId}] Failed to end session: ${endErr.message}`,
        );
      }
    }
  }

  /**
   * Executes a function within a transaction
   * Automatically commits, aborts, and cleans up the session
   */
  async withTransaction<T>(
    operation: (context: TransactionContext) => Promise<T>,
  ): Promise<T> {
    const context = await this.createContext();

    try {
      const result = await operation(context);
      if (context.useTransaction) {
        await this.commitTransaction(context);
      }
      return result;
    } catch (error) {
      if (context.useTransaction) {
        await this.abortTransaction(context);
      }
      throw error;
    } finally {
      await this.endSession(context);
    }
  }
}
```

<a id="file-15"></a>
## 15. D:\Projects\Desktop\content-management\backend\src\config\configuration.ts

**File Size:** 0.77 KB | **Last Modified:** 04/29/2025 16:26:22

\\\$language
// src/config/configuration.ts
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  environment: process.env.NODE_ENV,
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,

  mongo: {
    uri:
      process.env.MONGO_URI || 'mongodb://localhost:27017/content-management',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  spaces: {
    endpoint: process.env.SPACES_ENDPOINT,
    key: process.env.SPACES_KEY,
    secret: process.env.SPACES_SECRET,
    bucket: process.env.SPACES_BUCKET,
  },
}));
```

<a id="file-16"></a>
## 16. D:\Projects\Desktop\content-management\backend\src\config\env.validation.ts

**File Size:** 0.68 KB | **Last Modified:** 04/29/2025 16:26:32

\\\$language
// src/config/env.validation.ts

import * as Joi from 'joi';

export const environmentValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  MONGO_URI: Joi.string().uri().required(),

  REDIS_HOST: Joi.string().hostname().required(),
  REDIS_PORT: Joi.number().default(6379),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('3600s'),

  SPACES_ENDPOINT: Joi.string().uri().required(),
  SPACES_KEY: Joi.string().required(),
  SPACES_SECRET: Joi.string().required(),
  SPACES_BUCKET: Joi.string().required(),
});
```

<a id="file-17"></a>
## 17. D:\Projects\Desktop\content-management\backend\src\modules\auth\auth.controller.ts

**File Size:** 2.02 KB | **Last Modified:** 04/29/2025 19:27:25

\\\$language
// src/modules/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from '@common/decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   */
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**ls
   * Login endpoint- Returns { accessToken, expiresIn }
   * - Uses LocalAuthGuard to validate credentials
   * - Returns { accessToken, expiresIn }
   */
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Request() req) {
    await this.authService.logout(req.user.jti);
  }

  /**
   * Change user's password
   * - Requires authentication
   * - Validates current password
   * - Updates to new password
   */
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req,
  ) {
    await this.authService.changePassword(req.user.userId, changePasswordDto);
  }

  /**
   * Get authenticated user's profile
   * - Returns user data without sensitive information
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }
}
```

<a id="file-18"></a>
## 18. D:\Projects\Desktop\content-management\backend\src\modules\auth\auth.module.ts

**File Size:** 1.1 KB | **Last Modified:** 04/29/2025 16:21:32

\\\$language
// src/modules/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '@users/users.module';
import { CacheModule } from '@common/cache/cache.module';

@Module({
  imports: [
    UsersModule, // for UsersService & password hashing
    CacheModule, // for CacheService
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService) => ({
        secret: cs.get<string>('app.jwt.secret'),
        signOptions: { expiresIn: cs.get<string>('app.jwt.expiresIn') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
```

<a id="file-19"></a>
## 19. D:\Projects\Desktop\content-management\backend\src\modules\auth\auth.service.ts

**File Size:** 3.98 KB | **Last Modified:** 04/29/2025 20:01:30

\\\$language
// src/modules/auth/auth.service.ts

import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '@users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CacheService } from '@common/cache/cache.service';
import { randomUUID } from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User, UserDocument } from '@users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Verify passwords match
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Create new user (name is optional, will be generated if not provided)
    const user = await this.usersService.create(
      {
        email: registerDto.email,
        password: registerDto.password,
        name: registerDto.name, // This will be undefined if not provided
        role: 'client', // Default role
      },
      'SYSTEM',
    );

    // Return user without password
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async validateUser(email: string, pass: string): Promise<UserDocument> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User with this email not found');
    }

    if (!(await this.usersService.verifyPassword(user, pass))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(user: any) {
    const jti = randomUUID();
    const payload = { sub: user.id, role: user.role, jti };

    // Define JWT expiration (in seconds)
    const expiresIn = 3600; // 1 hour
    const token = this.jwtService.sign(payload, { expiresIn: `${expiresIn}s` });

    // Use the same expiration for the cache
    await this.cacheService.set(`jti:${jti}`, user.id, expiresIn);

    return {
      accessToken: token,
    };
  }

  async logout(jti: string) {
    await this.cacheService.del(`jti:${jti}`);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    // Get full user document to verify password
    const user = await this.usersService.findByEmail(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isValidPassword = await this.usersService.verifyPassword(
      user,
      dto.currentPassword,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Verify new passwords match
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    // Update password
    await this.usersService.update(
      user._id.toString(), // Ensure we convert ObjectId to string here too
      { password: dto.newPassword },
      userId,
    );
  }

  /**
   * Get user profile data
   * Return clean user object without sensitive information
   */
  async getProfile(userId: string) {
    const user = await this.usersService.findOne(userId);

    // Return only necessary fields (password already excluded by UsersService)
    return {
      id: user._id?.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
```

<a id="file-20"></a>
## 20. D:\Projects\Desktop\content-management\backend\src\modules\auth\dto\change-password.dto.ts

**File Size:** 0.49 KB | **Last Modified:** 04/29/2025 16:03:19

\\\$language
// /src/modules/auth/dto/change-password.dto.ts

import { IsNotEmpty, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  currentPassword: string;

  @IsNotEmpty()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must include at least 1 uppercase, 1 lowercase, and 1 number/special character',
  })
  newPassword: string;

  @IsNotEmpty()
  confirmPassword: string;
}
```

<a id="file-21"></a>
## 21. D:\Projects\Desktop\content-management\backend\src\modules\auth\dto\login.dto.ts

**File Size:** 0.26 KB | **Last Modified:** 04/29/2025 16:53:39

\\\$language
// src/modules/auth/dto/login.dto.ts

import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6) // Match the registration requirement
  password: string;
}
```

<a id="file-22"></a>
## 22. D:\Projects\Desktop\content-management\backend\src\modules\auth\dto\register.dto.ts

**File Size:** 0.38 KB | **Last Modified:** 04/29/2025 20:01:22

\\\$language
// /src/modules/auth/dto/register.dto.ts

import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @MinLength(6)
  confirmPassword: string;

  @IsOptional()
  @IsString()
  name?: string;
}
```

<a id="file-23"></a>
## 23. D:\Projects\Desktop\content-management\backend\src\modules\auth\guards\jwt-auth.guard.ts

**File Size:** 0.92 KB | **Last Modified:** 04/29/2025 16:04:00

\\\$language
// /src/modules/auth/guards/jwt-auth.guard.ts

import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '@common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If route is public, allow access without JWT
    if (isPublic) {
      return true;
    }

    // Otherwise perform JWT validation
    return super.canActivate(context);
  }
}
```

<a id="file-24"></a>
## 24. D:\Projects\Desktop\content-management\backend\src\modules\auth\guards\local-auth.guard.ts

**File Size:** 0.21 KB | **Last Modified:** 04/29/2025 16:03:51

\\\$language
// /src/modules/auth/guards/local-auth.guard.ts

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
```

<a id="file-25"></a>
## 25. D:\Projects\Desktop\content-management\backend\src\modules\auth\strategies\jwt.strategy.ts

**File Size:** 1.09 KB | **Last Modified:** 04/30/2025 16:56:38

\\\$language
// src/modules/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '@common/cache/cache.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly cacheService: CacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('app.jwt.secret'),
    });
  }

  /**
   * Validate JWT payload:
   * - Check if jti is still present in Redis
   */
  async validate(payload: any) {
    const jti = payload.jti;
    const exists = await this.cacheService.get(`jti:${jti}`);
    if (!exists) {
      throw new UnauthorizedException('Token revoked');
    }
    // attach user info & jti to req.user
    return { userId: payload.sub, role: payload.role, jti };
  }
}
```

<a id="file-26"></a>
## 26. D:\Projects\Desktop\content-management\backend\src\modules\auth\strategies\local.strategy.ts

**File Size:** 0.8 KB | **Last Modified:** 04/29/2025 16:04:08

\\\$language
// src/modules/auth/local.strategy.ts

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    // use 'email' instead of 'username'
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    // append jti and other claims later in AuthService.login
    return { id: user.id, email: user.email, role: user.role };
  }
}
```

<a id="file-27"></a>
## 27. D:\Projects\Desktop\content-management\backend\src\modules\content\content.controller.ts

**File Size:** 4.05 KB | **Last Modified:** 04/30/2025 18:06:19

\\\$language
// /src/modules/content/content.controller.ts

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { UpdateContentDto } from './dto/update-content.dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { PaginationQueryDto } from '@common/dto/pagination.dto';
import { ContentResponseDto } from './dto/content-response.dto';
import { CreateContentWithBlocksDto } from './dto/create-content-with-blocks.dto';
import { Public } from '@common/decorators/public.decorator';

@Controller('content')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  /**
   * POST /content
   * Create content with multiple block types in a single request
   * Supports text blocks, image blocks with file associations, and video blocks
   * Editors & Admins only
   */
  @Roles('editor', 'admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateContentWithBlocksDto,
    @Request() req,
  ): Promise<{
    success: boolean;
    content: ContentResponseDto;
    message: string;
    transactionId: string;
  }> {
    const { content, transactionId } =
      await this.contentService.createContentWithBlocks(dto, req.user.userId);

    return {
      success: true,
      content,
      message: `Content "${content.title}" with ${content.blocks.length} blocks has been created successfully`,
      transactionId,
    };
  }

  /** All authenticated roles (clients) can read with pagination */
  @Roles('client', 'editor', 'admin')
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.contentService.findAll(query);
  }

  /** Admin only - Get deleted content with pagination */
  @Roles('admin')
  @Get('deleted')
  findDeleted(@Query() query: PaginationQueryDto) {
    return this.contentService.findDeleted(query);
  }

  /** All authenticated roles can read single content */
  @Roles('client', 'editor', 'admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contentService.findOne(id);
  }

  /** Editor or Admin only - Update content */
  @Roles('editor', 'admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateContentDto,
    @Request() req,
  ): Promise<{
    success: boolean;
    content: ContentResponseDto;
    message: string;
  }> {
    const content = await this.contentService.update(id, dto, req.user.userId);
    return {
      success: true,
      content,
      message: `Content "${content.title}" has been updated successfully`,
    };
  }

  /** Admin only - Soft delete content */
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const result = await this.contentService.remove(id, req.user.userId);
    return {
      success: true,
      ...result,
    };
  }

  /** Admin only - Restore deleted content */
  @Roles('admin')
  @Post(':id/restore')
  async restore(@Param('id') id: string, @Request() req) {
    const result = await this.contentService.restore(id, req.user.userId);
    return {
      success: true,
      ...result,
    };
  }

  /** Admin only - Permanently delete content */
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @Delete(':id/permanent')
  async permanentDelete(@Param('id') id: string) {
    const result = await this.contentService.permanentDelete(id);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * GET /content/health
   * Health check endpoint
   * Public access
   */
  @Public()
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
```

<a id="file-28"></a>
## 28. D:\Projects\Desktop\content-management\backend\src\modules\content\content.module.ts

**File Size:** 0.93 KB | **Last Modified:** 04/30/2025 23:01:59

\\\$language
// /src/modules/content/content.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { Content, ContentSchema } from './schemas/content.schema';
import { ContentGateway } from '@/websocket/content.gateway';
import { FilesModule } from '@modules/files/files.module';
import { TransactionService } from '@common/services/transaction.service';
import { ContentProcessorService } from './services/content-processor.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }]),
    FilesModule,
  ],
  controllers: [ContentController],
  providers: [
    ContentService,
    ContentGateway,
    TransactionService,
    ContentProcessorService,
  ],
  exports: [ContentService],
})
export class ContentModule {}
```

<a id="file-29"></a>
## 29. D:\Projects\Desktop\content-management\backend\src\modules\content\content.service.ts

**File Size:** 9.58 KB | **Last Modified:** 04/30/2025 23:07:47

\\\$language
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
        this.model
          .find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.model.countDocuments(filter).exec(),
      ]);

      const contentDtos = contents.map((content) =>
        this.toResponseDto(content),
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
```

<a id="file-30"></a>
## 30. D:\Projects\Desktop\content-management\backend\src\modules\content\dto\content-response.dto.ts

**File Size:** 0.93 KB | **Last Modified:** 04/30/2025 17:42:22

\\\$language
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
```

<a id="file-31"></a>
## 31. D:\Projects\Desktop\content-management\backend\src\modules\content\dto\create-content-with-blocks.dto.ts

**File Size:** 1.15 KB | **Last Modified:** 04/30/2025 21:42:27

\\\$language
// /src/modules/content/dto/create-content-with-blocks.dto.ts

import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsEnum,
  IsOptional,
  IsUrl,
  MaxLength,
  ArrayMinSize,
  IsObject,
  IsUUID,
} from 'class-validator';

export class ContentBlockDto {
  @IsEnum(['text', 'image', 'video'], {
    message: 'Block type must be one of: text, image, or video',
  })
  type: 'text' | 'image' | 'video';

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  text?: string;

  @IsOptional()
  @IsUrl({}, { message: 'URL must be a valid URL format' })
  url?: string;

  @IsOptional()
  @IsString()
  fileId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CreateContentWithBlocksDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ContentBlockDto)
  blocks: ContentBlockDto[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
```

<a id="file-32"></a>
## 32. D:\Projects\Desktop\content-management\backend\src\modules\content\dto\create-content.dto.ts

**File Size:** 1.26 KB | **Last Modified:** 04/29/2025 21:56:42

\\\$language
// /src/modules/content/dto/create-content.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsEnum,
  IsOptional,
  IsUrl,
  MaxLength,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BlockDto {
  @IsEnum(['text', 'image', 'video'], {
    message: 'Block type must be one of: text, image, or video',
  })
  type: 'text' | 'image' | 'video';

  @IsOptional()
  @IsString({ message: 'Text must be a string' })
  @MaxLength(10000, { message: 'Text cannot exceed 10000 characters' })
  text?: string;

  @IsOptional()
  @IsUrl({}, { message: 'URL must be a valid URL format' })
  url?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreateContentDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(255, { message: 'Title cannot exceed 255 characters' })
  title: string;

  @IsArray({ message: 'Content blocks must be an array' })
  @ArrayMinSize(1, { message: 'At least one content block is required' })
  @ArrayMaxSize(100, { message: 'Maximum 100 content blocks allowed' })
  @ValidateNested({ each: true })
  @Type(() => BlockDto)
  blocks: BlockDto[];
}
```

<a id="file-33"></a>
## 33. D:\Projects\Desktop\content-management\backend\src\modules\content\dto\update-content.dto.ts

**File Size:** 0.23 KB | **Last Modified:** 04/30/2025 16:56:31

\\\$language
// /src/modules/content/dto/update-content.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateContentDto } from './create-content.dto';

export class UpdateContentDto extends PartialType(CreateContentDto) {}
```

<a id="file-34"></a>
## 34. D:\Projects\Desktop\content-management\backend\src\modules\content\schemas\content.schema.ts

**File Size:** 1.21 KB | **Last Modified:** 04/30/2025 18:11:09

\\\$language
// /src/modules/content/schemas/content.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ContentDocument = Content & Document;

/** Sub-document for a single block */
export class Block {
  @Prop({ required: true, enum: ['text', 'image', 'video', 'audio'] })
  type: 'text' | 'image' | 'video' | 'audio';

  @Prop() text?: string; // for text blocks
  @Prop() url?: string; // for image/video/audio blocks
  @Prop({ type: MongooseSchema.Types.Mixed }) metadata?: Record<string, any>; // e.g. alt text or dimensions
}

@Schema({ timestamps: true })
export class Content {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: [Block], _id: false })
  blocks: Block[];

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, any>;

  @Prop() createdBy: string;
  @Prop() updatedBy: string;

  // Soft delete properties
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ type: String, default: null })
  deletedBy: string | null;
}

export const ContentSchema = SchemaFactory.createForClass(Content);
```

<a id="file-35"></a>
## 35. D:\Projects\Desktop\content-management\backend\src\modules\content\services\content-processor.service.ts

**File Size:** 4.17 KB | **Last Modified:** 04/30/2025 23:09:16

\\\$language
// /src/modules/content/services/content-processor.service.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import { FilesService } from '@modules/files/files.service';
import { Block } from '../schemas/content.schema';
import { ContentBlockDto } from '../dto/create-content-with-blocks.dto';

@Injectable()
export class ContentProcessorService {
  constructor(private readonly filesService: FilesService) {}

  /**
   * Process and validate content blocks including file references
   */
  async processBlocks(
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
          await this.processTextBlock(block, processedBlock, i);
          break;

        case 'image':
          await this.processImageBlock(block, processedBlock, i);
          break;

        case 'video':
          await this.processVideoBlock(block, processedBlock, i);
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

  /**
   * Process text block
   */
  private async processTextBlock(
    block: ContentBlockDto,
    processedBlock: Block,
    index: number,
  ): Promise<void> {
    if (!block.text) {
      throw new BadRequestException(
        `Block #${index + 1}: Text blocks require 'text' property`,
      );
    }
    processedBlock.text = block.text;
    processedBlock.metadata!.textType = block.metadata?.textType || 'paragraph';
  }

  /**
   * Process image block
   */
  private async processImageBlock(
    block: ContentBlockDto,
    processedBlock: Block,
    index: number,
  ): Promise<void> {
    if (block.url) {
      processedBlock.url = block.url;
    } else if (block.fileId) {
      await this.processFileReference(
        block.fileId,
        processedBlock,
        index,
        false,
      );
    } else {
      throw new BadRequestException(
        `Block #${index + 1}: Image blocks require 'url' or 'fileId'`,
      );
    }
  }

  /**
   * Process video block
   */
  private async processVideoBlock(
    block: ContentBlockDto,
    processedBlock: Block,
    index: number,
  ): Promise<void> {
    if (block.url) {
      processedBlock.url = block.url;
    } else if (block.fileId) {
      await this.processFileReference(
        block.fileId,
        processedBlock,
        index,
        true,
      );
      // Add video-specific metadata
      if (block.metadata?.duration) {
        processedBlock.metadata!.duration = block.metadata.duration;
      }
      if (block.metadata?.thumbnail) {
        processedBlock.metadata!.thumbnail = block.metadata.thumbnail;
      }
    } else {
      throw new BadRequestException(
        `Block #${index + 1}: Video blocks require 'url' or 'fileId'`,
      );
    }
  }

  /**
   * Process file reference for blocks
   */
  private async processFileReference(
    fileId: string,
    processedBlock: Block,
    index: number,
    isVideo: boolean,
  ): Promise<void> {
    try {
      const file = await this.filesService.findOne(fileId);
      processedBlock.url = file.url;

      // Ensure metadata object exists
      if (!processedBlock.metadata) {
        processedBlock.metadata = {};
      }

      // Set file metadata
      processedBlock.metadata.fileId = file.id;
      processedBlock.metadata.fileName = file.filename;
      processedBlock.metadata.fileType = file.contentType;
      processedBlock.metadata.fileSize = file.size;
      processedBlock.metadata.uploadedBy = file.createdBy;
    } catch (error) {
      throw new BadRequestException(
        `Block #${index + 1}: File with ID ${fileId} not found`,
      );
    }
  }
}
```

<a id="file-36"></a>
## 36. D:\Projects\Desktop\content-management\backend\src\modules\files\files.controller.ts

**File Size:** 4.85 KB | **Last Modified:** 04/30/2025 21:52:32

\\\$language
// /src/modules/files/files.controller.ts

import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseFilePipe,
  MaxFileSizeValidator,
  BadRequestException,
  Delete,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService, FileUploadOptions } from './files.service';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UpdateFileDto } from './dto/update-file.dto';
import { PaginationQueryDto } from '@common/dto/pagination.dto';

@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * GET /files
   * List all files with pagination
   * Editors & Admins only
   */
  @Roles('editor', 'admin')
  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    return this.filesService.findAll(query);
  }

  /**
   * GET /files/:id
   * Get a single file by ID
   * Editors & Admins only
   */
  @Roles('editor', 'admin')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.filesService.findOne(id);
  }

  /**
   * POST /files/upload
   * Uploads a file to DigitalOcean Spaces
   * Editors & Admins only
   */
  @Roles('editor', 'admin')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          // FileTypeValidator removed - relying on service validation
        ],
        fileIsRequired: true,
        exceptionFactory: (error) => new BadRequestException(error),
      }),
    )
    file: Express.Multer.File,
    @Request() req,
    @Query('folder') folder?: string,
    @Query('private') isPrivate?: boolean,
  ) {
    const options: FileUploadOptions = {
      folder: folder,
      isPrivate: isPrivate === true,
      createdBy: req.user.userId,
    };

    const result = await this.filesService.uploadFile(file, options);

    return {
      success: true,
      data: result,
      message: 'File uploaded successfully',
    };
  }

  /**
   * PATCH /files/:id
   * Update file metadata
   * Editors & Admins only
   */
  @Roles('editor', 'admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFileDto: UpdateFileDto,
    @Request() req,
  ) {
    const result = await this.filesService.update(
      id,
      updateFileDto,
      req.user.userId,
    );

    return {
      success: true,
      data: result,
      message: 'File metadata updated successfully',
    };
  }

  /**
   * DELETE /files/:id
   * Soft delete a file (marks as deleted in database)
   * Admin only
   */
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const result = await this.filesService.remove(id, req.user.userId);

    return {
      success: true,
      data: result.file,
      message: result.message,
    };
  }

  /**
   * POST /files/:id/restore
   * Restore a soft-deleted file
   * Admin only
   */
  @Roles('admin')
  @Post(':id/restore')
  async restore(@Param('id') id: string, @Request() req) {
    const result = await this.filesService.restore(id, req.user.userId);

    return {
      success: true,
      data: result,
      message: 'File restored successfully',
    };
  }

  /**
   * DELETE /files/:id/permanent
   * Permanently delete a file (from storage and database)
   * Admin only
   */
  @Roles('admin')
  @Delete(':id/permanent')
  async permanentDelete(@Param('id') id: string) {
    const result = await this.filesService.permanentDelete(id);

    return {
      success: true,
      message: result.message,
    };
  }

  /**
   * DELETE /files/storage/:key
   * Deletes a file from DigitalOcean Spaces by key
   * Admin only
   */
  @Roles('admin')
  @Delete('storage/:key')
  async deleteFileByKey(@Param('key') key: string) {
    await this.filesService.deleteFile(key);

    return {
      success: true,
      message: 'File deleted successfully from storage',
    };
  }

  /**
   * GET /files/storage/list
   * List files in DigitalOcean Spaces
   * Admin only
   */
  @Roles('admin')
  @Get('storage/list')
  async listFilesInStorage(
    @Query('folder') folder?: string,
    @Query('maxKeys') maxKeys?: number,
  ) {
    const result = await this.filesService.listFilesInStorage(
      folder,
      maxKeys ? parseInt(maxKeys.toString()) : 1000,
    );

    return {
      success: true,
      data: result,
      message: 'Files listed successfully',
    };
  }
}
```

<a id="file-37"></a>
## 37. D:\Projects\Desktop\content-management\backend\src\modules\files\files.module.ts

**File Size:** 0.77 KB | **Last Modified:** 04/30/2025 23:06:53

\\\$language
// /src/modules/files/files.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { File, FileSchema } from './schemas/file.schema';
import { S3StorageService } from '@common/services/storage.service';
import { FileValidatorService } from './services/file-validator.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  providers: [FilesService, S3StorageService, FileValidatorService],
  controllers: [FilesController],
  exports: [FilesService],
})
export class FilesModule {}
```

<a id="file-38"></a>
## 38. D:\Projects\Desktop\content-management\backend\src\modules\files\files.service.ts

**File Size:** 6.99 KB | **Last Modified:** 04/30/2025 23:06:35

\\\$language
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
```

<a id="file-39"></a>
## 39. D:\Projects\Desktop\content-management\backend\src\modules\files\dto\file-response.dto.ts

**File Size:** 1.11 KB | **Last Modified:** 04/29/2025 22:51:12

\\\$language
// /src/modules/files/dto/file-response.dto.ts

/**
 * Standardized file response format
 */
export class FileResponseDto {
  id: string;
  filename: string;
  originalName: string;
  key: string;
  url: string;
  contentType: string;
  size: number;
  folder?: string;
  isPrivate: boolean;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
  deletedBy?: string | null;

  // Helper method to convert from File entity to DTO
  static fromEntity(file: any): FileResponseDto {
    return {
      id: file._id?.toString(),
      filename: file.filename,
      originalName: file.originalName,
      key: file.key,
      url: file.url,
      contentType: file.contentType,
      size: file.size,
      folder: file.folder,
      isPrivate: file.isPrivate,
      metadata: file.metadata,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      createdBy: file.createdBy,
      updatedBy: file.updatedBy,
      deletedAt: file.deletedAt,
      deletedBy: file.deletedBy,
    };
  }
}
```

<a id="file-40"></a>
## 40. D:\Projects\Desktop\content-management\backend\src\modules\files\dto\update-file.dto.ts

**File Size:** 0.39 KB | **Last Modified:** 04/29/2025 23:00:26

\\\$language
// /src/modules/files/dto/update-file.dto.ts

import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateFileDto {
  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
```

<a id="file-41"></a>
## 41. D:\Projects\Desktop\content-management\backend\src\modules\files\dto\upload-file.dto.ts

**File Size:** 0.39 KB | **Last Modified:** 04/29/2025 22:51:11

\\\$language
// /src/modules/files/dto/upload-file.dto.ts

import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class UploadFileDto {
  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}
```

<a id="file-42"></a>
## 42. D:\Projects\Desktop\content-management\backend\src\modules\files\schemas\file.schema.ts

**File Size:** 1.04 KB | **Last Modified:** 04/29/2025 22:51:21

\\\$language
// /src/modules/files/schemas/file.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type FileDocument = File & Document;

@Schema({ timestamps: true })
export class File {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  contentType: string;

  @Prop({ required: true })
  size: number;

  @Prop()
  folder?: string;

  @Prop({ default: false })
  isPrivate: boolean;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, any>;

  @Prop()
  createdBy: string;

  @Prop()
  updatedBy: string;

  // Soft delete properties
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ type: String, default: null })
  deletedBy: string | null;
}

export const FileSchema = SchemaFactory.createForClass(File);
```

<a id="file-43"></a>
## 43. D:\Projects\Desktop\content-management\backend\src\modules\files\services\file-validator.service.ts

**File Size:** 2.09 KB | **Last Modified:** 04/30/2025 23:09:24

\\\$language
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
```

<a id="file-44"></a>
## 44. D:\Projects\Desktop\content-management\backend\src\modules\users\users.controller.ts

**File Size:** 2.78 KB | **Last Modified:** 04/29/2025 20:18:19

\\\$language
// /src/modules/users/users.controller.ts

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { PaginationQueryDto } from '@common/dto/pagination.dto';
import { UserResponseDto } from './dto/user-response.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Admin only */
  @Roles('admin')
  @Post()
  async create(
    @Body() dto: CreateUserDto,
    @Request() req,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.create(dto, req.user.userId);
    return UserResponseDto.fromEntity(user);
  }

  /** Admin only - Get active users with pagination */
  @Roles('admin')
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAllPaginated(query);
  }

  /** Admin only - Get deleted users with pagination */
  @Roles('admin')
  @Get('deleted')
  findDeleted(@Query() query: PaginationQueryDto) {
    return this.usersService.findDeletedPaginated(query);
  }

  /** Admin only - Get single active user */
  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(id);
    return UserResponseDto.fromEntity(user);
  }

  /** Admin only */
  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Request() req,
  ) {
    const user = await this.usersService.update(id, dto, req.user.userId);
    return UserResponseDto.fromEntity(user);
  }

  /** Admin only - Soft delete */
  @Roles('admin')
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req,
  ): Promise<UserResponseDto> {
    return this.usersService.remove(id, req.user.userId);
  }

  /** Admin only - Restore soft-deleted user */
  @Roles('admin')
  @Post(':id/restore')
  async restore(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.restore(id, req.user.userId);
    return UserResponseDto.fromEntity(user);
  }

  /** Admin only - Permanently delete */
  @Roles('admin')
  @Delete(':id/permanent')
  async permanentDelete(
    @Param('id') id: string,
  ): Promise<{ id: string; deleted: boolean; message: string }> {
    return this.usersService.permanentDelete(id);
  }
}
```

<a id="file-45"></a>
## 45. D:\Projects\Desktop\content-management\backend\src\modules\users\users.module.ts

**File Size:** 0.54 KB | **Last Modified:** 04/29/2025 20:18:19

\\\$language
// /src/modules/users/users.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], // for AuthService
})
export class UsersModule {}
```

<a id="file-46"></a>
## 46. D:\Projects\Desktop\content-management\backend\src\modules\users\users.service.ts

**File Size:** 6.05 KB | **Last Modified:** 04/29/2025 20:18:20

\\\$language
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
    return this.findAllPaginated(query, true);
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
```

<a id="file-47"></a>
## 47. D:\Projects\Desktop\content-management\backend\src\modules\users\dto\create-user.dto.ts

**File Size:** 0.54 KB | **Last Modified:** 04/29/2025 20:18:17

\\\$language
// /src/modules/users/dto/create-user.dto.ts

import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@common/decorators/roles.decorator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsEnum(['admin', 'editor', 'client'] as const, {
    message: 'role must be one of the following values: admin, editor, client',
  })
  role: Role;
}
```

<a id="file-48"></a>
## 48. D:\Projects\Desktop\content-management\backend\src\modules\users\dto\update-user.dto.ts

**File Size:** 0.57 KB | **Last Modified:** 04/29/2025 19:37:06

\\\$language
// /src/modules/users/dto/update-user.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsOptional, MinLength } from 'class-validator';
import { Role } from '@common/decorators/roles.decorator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsEnum(['admin', 'editor', 'client'] as const, {
    message: 'role must be one of the following values: admin, editor, client',
  })
  role?: Role;
}
```

<a id="file-49"></a>
## 49. D:\Projects\Desktop\content-management\backend\src\modules\users\dto\user-response.dto.ts

**File Size:** 0.89 KB | **Last Modified:** 04/29/2025 19:55:14

\\\$language
// /src/modules/users/dto/user-response.dto.ts

import { Role } from '@common/decorators/roles.decorator';

/**
 * Standardized user response format
 * Excludes sensitive information like password
 */
export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
  deletedBy?: string | null;

  // Helper method to convert from User entity to DTO
  static fromEntity(user: any): UserResponseDto {
    return {
      id: user._id?.toString(),
      email: user.email,
      name: user.name,
      role: user.role as Role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      createdBy: user.createdBy,
      updatedBy: user.updatedBy,
      deletedAt: user.deletedAt,
      deletedBy: user.deletedBy,
    };
  }
}
```

<a id="file-50"></a>
## 50. D:\Projects\Desktop\content-management\backend\src\modules\users\schemas\user.schema.ts

**File Size:** 1.31 KB | **Last Modified:** 04/29/2025 19:58:20

\\\$language
// /src/modules/users/schemas/user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  [x: string]: any;
  // Add explicit _id field to make TypeScript aware of it
  _id: Types.ObjectId;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string; // hashed via bcrypt

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['admin', 'editor', 'client'] })
  role: string;

  @Prop()
  createdBy: string;

  @Prop()
  updatedBy: string;

  // Soft delete properties
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  // Fix: Explicitly specify String type for deletedBy field
  @Prop({ type: String, default: null })
  deletedBy: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Hash password before saving
UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await import('bcrypt').then(({ genSalt }) => genSalt(10));
  this.password = await import('bcrypt').then(({ hash }) =>
    hash(this.password, salt),
  );
  next();
});
```

<a id="file-51"></a>
## 51. D:\Projects\Desktop\content-management\backend\src\websocket\content.gateway.ts

**File Size:** 1.05 KB | **Last Modified:** 04/29/2025 21:48:11

\\\$language
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  path: '/ws/content', // custom path (optional)
  cors: { origin: '*' }, // tighten in prod
})
export class ContentGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ContentGateway.name);

  afterInit(server: Server) {
    this.logger.log('ContentGateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Broadcast updated content to all clients.
   * If you want rooms, use this.server.to(room).emit(...)
   */
  broadcastContentUpdate(content: any) {
    this.server.emit('contentUpdated', content);
  }
}
```
