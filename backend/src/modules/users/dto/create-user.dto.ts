// /src/modules/users/dto/create-user.dto.ts

import { IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { Role } from '@common/decorators/roles.decorator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  name: string;

  @IsEnum(['admin', 'editor', 'client'] as const, {
    message: 'role must be one of the following values: admin, editor, client',
  })
  role: Role;
}
