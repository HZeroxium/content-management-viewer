// /src/modules/users/users.controller.ts

import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Admin only */
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateUserDto, @Request() req) {
    return this.usersService.create(dto, req.user.userId);
  }

  /** Admin only */
  @Roles('admin')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /** Admin only */
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /** Admin only */
  @Roles('admin')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Request() req) {
    return this.usersService.update(id, dto, req.user.userId);
  }

  /** Admin only */
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
