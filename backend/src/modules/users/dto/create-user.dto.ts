// /src/modules/users/dto/create-user.dto.ts

import { IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { Role } from '@common/decorators/roles.decorator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  name: string;

  @IsEnum(['admin', 'editor', 'client'] as const)
  role: Role;
}
