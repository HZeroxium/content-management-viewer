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
  @IsEnum(['admin', 'editor', 'client'] as const)
  role?: Role;
}
