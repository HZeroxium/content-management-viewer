// /src/modules/content/content.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content, ContentDocument } from './schemas/content.schema';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentGateway } from '@/websocket/content.gateway';

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>,
    private readonly gateway: ContentGateway,
  ) {}

  /** Create new content, record who created it */
  async create(dto: CreateContentDto, createdBy: string): Promise<Content> {
    const created = new this.contentModel({
      ...dto,
      createdBy,
      updatedBy: createdBy,
    });
    // broadcast after create
    this.gateway.broadcastContentUpdate(created);
    return created.save();
  }

  /** Public read: lean for performance */
  findAll(): Promise<Content[]> {
    return this.contentModel.find().lean().exec();
  }

  async findOne(id: string): Promise<Content> {
    const content = await this.contentModel.findById(id).lean().exec();
    if (!content) throw new NotFoundException(`Content ${id} not found`);
    return content;
  }

  /** Update, record who did it */
  async update(
    id: string,
    dto: UpdateContentDto,
    updatedBy: string,
  ): Promise<Content> {
    const update = { ...dto, updatedBy };
    const content = await this.contentModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
    if (!content) throw new NotFoundException(`Content ${id} not found`);
    this.gateway.broadcastContentUpdate(content); // broadcast after update
    return content;
  }

  async remove(id: string): Promise<void> {
    const res = await this.contentModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException(`Content ${id} not found`);
    this.gateway.broadcastContentUpdate({ id, deleted: true });
  }
}
