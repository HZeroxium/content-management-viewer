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
