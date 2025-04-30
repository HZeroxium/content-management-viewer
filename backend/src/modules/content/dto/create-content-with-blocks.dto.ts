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
