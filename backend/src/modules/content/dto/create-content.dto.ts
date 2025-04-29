// /src/modules/content/dto/create-content.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsEnum,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BlockDto {
  @IsEnum(['text', 'image', 'video'])
  type: 'text' | 'image' | 'video';

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreateContentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockDto)
  blocks: BlockDto[];
}
