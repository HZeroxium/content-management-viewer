// /src/modules/users/users.controller.ts

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { PaginationQueryDto } from '@common/dto/pagination.dto';
import { UserResponseDto } from './dto/user-response.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Admin only */
  @Roles('admin')
  @Post()
  async create(
    @Body() dto: CreateUserDto,
    @Request() req,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.create(dto, req.user.userId);
    return UserResponseDto.fromEntity(user);
  }

  /** Admin only - Get active users with pagination */
  @Roles('admin')
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAllPaginated(query);
  }

  /** Admin only - Get deleted users with pagination */
  @Roles('admin')
  @Get('deleted')
  findDeleted(@Query() query: PaginationQueryDto) {
    return this.usersService.findDeletedPaginated(query);
  }

  /** Admin only - Get single active user */
  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(id);
    return UserResponseDto.fromEntity(user);
  }

  /** Admin only */
  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Request() req,
  ) {
    const user = await this.usersService.update(id, dto, req.user.userId);
    return UserResponseDto.fromEntity(user);
  }

  /** Admin only - Soft delete */
  @Roles('admin')
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req,
  ): Promise<UserResponseDto> {
    return this.usersService.remove(id, req.user.userId);
  }

  /** Admin only - Restore soft-deleted user */
  @Roles('admin')
  @Post(':id/restore')
  async restore(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.restore(id, req.user.userId);
    return UserResponseDto.fromEntity(user);
  }

  /** Admin only - Permanently delete */
  @Roles('admin')
  @Delete(':id/permanent')
  async permanentDelete(
    @Param('id') id: string,
  ): Promise<{ id: string; deleted: boolean; message: string }> {
    return this.usersService.permanentDelete(id);
  }
}
