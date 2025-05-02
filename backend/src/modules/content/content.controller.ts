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
import { UpdateContentDto } from './dto/update-content.dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { PaginationQueryDto } from '@common/dto/pagination.dto';
import { ContentResponseDto } from './dto/content-response.dto';
import { CreateContentWithBlocksDto } from './dto/create-content-with-blocks.dto';
import { Public } from '@common/decorators/public.decorator';
import { ContentGateway } from '../../websocket/content.gateway';

@Controller('content')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly contentGateway: ContentGateway,
  ) {}

  /**
   * POST /content
   * Create content with multiple block types in a single request
   * Supports text blocks, image blocks with file associations, and video blocks
   * Editors & Admins only
   */
  @Roles('editor', 'admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateContentWithBlocksDto,
    @Request() req,
  ): Promise<{
    success: boolean;
    content: ContentResponseDto;
    message: string;
    transactionId: string;
  }> {
    const { content, transactionId } =
      await this.contentService.createContentWithBlocks(dto, req.user.userId);

    return {
      success: true,
      content,
      message: `Content "${content.title}" with ${content.blocks.length} blocks has been created successfully`,
      transactionId,
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
  ): Promise<{
    success: boolean;
    content: ContentResponseDto;
    message: string;
  }> {
    const content = await this.contentService.update(id, dto, req.user.userId);

    // Broadcast the content update to all connected clients
    this.contentGateway.broadcastContentUpdate({
      id: content.id,
      action: 'update',
      data: content,
    });

    return {
      success: true,
      content,
      message: `Content "${content.title}" has been updated successfully`,
    };
  }

  /** Admin only - Soft delete content */
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const result = await this.contentService.remove(id, req.user.userId);
    return {
      success: true,
      ...result,
    };
  }

  /** Admin only - Restore deleted content */
  @Roles('admin')
  @Post(':id/restore')
  async restore(@Param('id') id: string, @Request() req) {
    const result = await this.contentService.restore(id, req.user.userId);
    return {
      success: true,
      ...result,
    };
  }

  /** Admin only - Permanently delete content */
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @Delete(':id/permanent')
  async permanentDelete(@Param('id') id: string) {
    const result = await this.contentService.permanentDelete(id);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * GET /content/health
   * Health check endpoint
   * Public access
   */
  @Public()
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
