// /src/modules/auth/dto/change-password.dto.ts

import { IsNotEmpty, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  currentPassword: string;

  @IsNotEmpty()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must include at least 1 uppercase, 1 lowercase, and 1 number/special character',
  })
  newPassword: string;

  @IsNotEmpty()
  confirmPassword: string;
}
