// /src/modules/users/dto/user-response.dto.ts

import { Role } from '@common/decorators/roles.decorator';

/**
 * Standardized user response format
 * Excludes sensitive information like password
 */
export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
  deletedBy?: string | null;

  // Helper method to convert from User entity to DTO
  static fromEntity(user: any): UserResponseDto {
    return {
      id: user._id?.toString(),
      email: user.email,
      name: user.name,
      role: user.role as Role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      createdBy: user.createdBy,
      updatedBy: user.updatedBy,
      deletedAt: user.deletedAt,
      deletedBy: user.deletedBy,
    };
  }
}
