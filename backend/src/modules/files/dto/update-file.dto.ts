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
