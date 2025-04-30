// /src/modules/content/content.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { Content, ContentSchema } from './schemas/content.schema';
import { ContentGateway } from '@/websocket/content.gateway';
import { FilesModule } from '@modules/files/files.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }]),
    FilesModule, // Import FilesModule to use FilesService
  ],
  controllers: [ContentController],
  providers: [ContentService, ContentGateway],
  exports: [ContentService],
})
export class ContentModule {}
