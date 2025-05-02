// /src/modules/files/files.controller.ts

import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseFilePipe,
  MaxFileSizeValidator,
  BadRequestException,
  Delete,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService, FileUploadOptions } from './files.service';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UpdateFileDto } from './dto/update-file.dto';
import { PaginationQueryDto } from '@common/dto/pagination.dto';

@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * GET /files
   * List all files with pagination
   * Editors & Admins only
   */
  @Roles('editor', 'admin')
  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    return this.filesService.findAll(query);
  }

  /**
   * GET /files/deleted
   * Get deleted files with pagination
   * Admin only
   */
  @Roles('admin')
  @Get('deleted')
  findDeleted(@Query() query: PaginationQueryDto) {
    return this.filesService.findDeleted(query);
  }

  /**
   * GET /files/storage/list
   * List files in DigitalOcean Spaces
   * Admin only
   */
  @Roles('admin')
  @Get('storage/list')
  async listFilesInStorage(
    @Query('folder') folder?: string,
    @Query('maxKeys') maxKeys?: number,
  ) {
    const result = await this.filesService.listFilesInStorage(
      folder,
      maxKeys ? parseInt(maxKeys.toString()) : 1000,
    );

    return {
      success: true,
      data: result,
      message: 'Files listed successfully',
    };
  }

  /**
   * GET /files/:id
   * Get a single file by ID
   * Editors & Admins only
   */
  @Roles('editor', 'admin')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.filesService.findOne(id);
  }

  /**
   * POST /files/upload
   * Uploads a file to DigitalOcean Spaces
   * Editors & Admins only
   */
  @Roles('editor', 'admin')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }), // 10MB
          // FileTypeValidator removed - relying on service validation
        ],
        fileIsRequired: true,
        exceptionFactory: (error) => new BadRequestException(error),
      }),
    )
    file: Express.Multer.File,
    @Request() req,
    @Query('folder') folder?: string,
    @Query('private') isPrivate?: boolean,
  ) {
    const options: FileUploadOptions = {
      folder: folder,
      isPrivate: isPrivate === true,
      createdBy: req.user.userId,
    };

    const result = await this.filesService.uploadFile(file, options);

    return {
      success: true,
      data: result,
      message: 'File uploaded successfully',
    };
  }

  /**
   * PATCH /files/:id
   * Update file metadata
   * Editors & Admins only
   */
  @Roles('editor', 'admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFileDto: UpdateFileDto,
    @Request() req,
  ) {
    const result = await this.filesService.update(
      id,
      updateFileDto,
      req.user.userId,
    );

    return {
      success: true,
      data: result,
      message: 'File metadata updated successfully',
    };
  }

  /**
   * DELETE /files/:id
   * Soft delete a file (marks as deleted in database)
   * Admin only
   */
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const result = await this.filesService.remove(id, req.user.userId);

    return {
      success: true,
      data: result.file,
      message: result.message,
    };
  }

  /**
   * POST /files/:id/restore
   * Restore a soft-deleted file
   * Admin only
   */
  @Roles('admin')
  @Post(':id/restore')
  async restore(@Param('id') id: string, @Request() req) {
    const result = await this.filesService.restore(id, req.user.userId);

    return {
      success: true,
      data: result,
      message: 'File restored successfully',
    };
  }

  /**
   * DELETE /files/:id/permanent
   * Permanently delete a file (from storage and database)
   * Admin only
   */
  @Roles('admin')
  @Delete(':id/permanent')
  async permanentDelete(@Param('id') id: string) {
    const result = await this.filesService.permanentDelete(id);

    return {
      success: true,
      message: result.message,
    };
  }

  /**
   * DELETE /files/storage/:key
   * Deletes a file from DigitalOcean Spaces by key
   * Admin only
   */
  @Roles('admin')
  @Delete('storage/:key')
  async deleteFileByKey(@Param('key') key: string) {
    await this.filesService.deleteFile(key);

    return {
      success: true,
      message: 'File deleted successfully from storage',
    };
  }
}
