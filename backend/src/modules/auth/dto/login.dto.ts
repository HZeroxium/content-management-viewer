// src/modules/auth/dto/login.dto.ts

import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6) // Match the registration requirement
  password: string;
}
