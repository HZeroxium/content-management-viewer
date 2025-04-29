// /src/modules/content/content.controller.ts

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { PaginationQueryDto } from '@common/dto/pagination.dto';
import { ContentResponseDto } from './dto/content-response.dto';

@Controller('content')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  /** Editor or Admin only - Create new content */
  @Roles('editor', 'admin')
  @Post()
  async create(
    @Body() dto: CreateContentDto,
    @Request() req,
  ): Promise<{ content: ContentResponseDto; message: string }> {
    const content = await this.contentService.create(dto, req.user.userId);
    return {
      content,
      message: `Content "${content.title}" has been created successfully`,
    };
  }

  /** All authenticated roles (clients) can read with pagination */
  @Roles('client', 'editor', 'admin')
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.contentService.findAll(query);
  }

  /** Admin only - Get deleted content with pagination */
  @Roles('admin')
  @Get('deleted')
  findDeleted(@Query() query: PaginationQueryDto) {
    return this.contentService.findDeleted(query);
  }

  /** All authenticated roles can read single content */
  @Roles('client', 'editor', 'admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contentService.findOne(id);
  }

  /** Editor or Admin only - Update content */
  @Roles('editor', 'admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateContentDto,
    @Request() req,
  ): Promise<{ content: ContentResponseDto; message: string }> {
    const content = await this.contentService.update(id, dto, req.user.userId);
    return {
      content,
      message: `Content "${content.title}" has been updated successfully`,
    };
  }

  /** Admin only - Soft delete content */
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.contentService.remove(id, req.user.userId);
  }

  /** Admin only - Restore deleted content */
  @Roles('admin')
  @Post(':id/restore')
  restore(@Param('id') id: string, @Request() req) {
    return this.contentService.restore(id, req.user.userId);
  }

  /** Admin only - Permanently delete content */
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @Delete(':id/permanent')
  permanentDelete(@Param('id') id: string) {
    return this.contentService.permanentDelete(id);
  }
}
