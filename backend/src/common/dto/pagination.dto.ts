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
