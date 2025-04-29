// /src/modules/content/content.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { Content, ContentSchema } from './schemas/content.schema';
import { ContentGateway } from '@/websocket/content.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }]),
  ],
  controllers: [ContentController],
  providers: [ContentService, ContentGateway],
})
export class ContentModule {}
