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
