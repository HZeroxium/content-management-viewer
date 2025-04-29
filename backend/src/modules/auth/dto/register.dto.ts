// /src/modules/auth/dto/register.dto.ts

import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  Matches,
  MinLength,
} from 'class-validator';
import { Role } from '@common/decorators/roles.decorator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must include at least 1 uppercase, 1 lowercase, and 1 number/special character',
  })
  password: string;

  @IsNotEmpty()
  name: string;

  @IsEnum(['admin', 'editor', 'client'] as const)
  role: Role;
}
