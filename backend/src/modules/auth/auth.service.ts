// src/modules/auth/auth.service.ts

import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '@users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CacheService } from '@common/cache/cache.service';
import { randomUUID } from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Register a new user
   * - Check if email already exists
   * - Create new user with SYSTEM as creator
   * - Return user without password
   */
  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Create new user (with SYSTEM as createdBy)
    const user = await this.usersService.create(registerDto, 'SYSTEM');

    // Return user without password
    return {
      id: user._id.toString(), // Convert ObjectId to string for safe JSON serialization
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  /**
   * Validate user credentials.
   * Throws if invalid.
   */
  async validateUser(email: string, pass: string): Promise<UserDocument> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await this.usersService.verifyPassword(user, pass))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  /**
   * On successful login:
   * - Generate JWT with jti (JWT ID)
   * - Store jti in Redis
   * - Return access token
   */
  async login(user: any) {
    const jti = randomUUID();
    const payload = { sub: user.id, role: user.role, jti };

    // Define JWT expiration (in seconds)
    const expiresIn = 3600; // 1 hour
    const token = this.jwtService.sign(payload, { expiresIn: `${expiresIn}s` });

    // Use the same expiration for the cache
    await this.cacheService.set(`jti:${jti}`, user.id, expiresIn);

    return {
      accessToken: token,
    };
  }

  /**
   * Remove the jti from Redis to revoke the token.
   */
  async logout(jti: string) {
    await this.cacheService.del(`jti:${jti}`);
  }

  /**
   * Change user's password
   */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    // Get full user document to verify password
    const user = await this.usersService.findByEmail(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isValidPassword = await this.usersService.verifyPassword(
      user,
      dto.currentPassword,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Verify new passwords match
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    // Update password
    await this.usersService.update(
      user._id.toString(), // Ensure we convert ObjectId to string here too
      { password: dto.newPassword },
      userId,
    );
  }
}
