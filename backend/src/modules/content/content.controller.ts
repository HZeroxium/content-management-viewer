// /src/modules/content/content.controller.ts

import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { JwtAuthGuard } from '@auth//guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@Controller('content')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  /** Editor or Admin only */
  @Roles('editor', 'admin')
  @Post()
  create(@Body() dto: CreateContentDto, @Request() req) {
    return this.contentService.create(dto, req.user.userId);
  }

  /** All authenticated roles (clients) can read */
  @Roles('client', 'editor', 'admin')
  @Get()
  findAll() {
    return this.contentService.findAll();
  }

  @Roles('client', 'editor', 'admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contentService.findOne(id);
  }

  /** Editor or Admin only */
  @Roles('editor', 'admin')
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateContentDto,
    @Request() req,
  ) {
    return this.contentService.update(id, dto, req.user.userId);
  }

  /** Admin only */
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contentService.remove(id);
  }
}
