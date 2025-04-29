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
import { User, UserDocument } from '@users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Verify passwords match
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Create new user with default values
    const user = await this.usersService.create(
      {
        email: registerDto.email,
        password: registerDto.password,
        name: `User-${randomUUID().substring(0, 8)}`, // Generate default name
        role: 'client', // Default role
      },
      'SYSTEM',
    );

    // Return user without password
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async validateUser(email: string, pass: string): Promise<UserDocument> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User with this email not found');
    }

    if (!(await this.usersService.verifyPassword(user, pass))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

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

  async logout(jti: string) {
    await this.cacheService.del(`jti:${jti}`);
  }

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

  /**
   * Get user profile data
   * Return clean user object without sensitive information
   */
  async getProfile(userId: string) {
    const user = await this.usersService.findOne(userId);

    // Return only necessary fields (password already excluded by UsersService)
    return {
      id: user._id?.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
