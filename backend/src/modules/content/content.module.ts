// /src/modules/content/content.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { Content, ContentSchema } from './schemas/content.schema';
import { ContentGateway } from '@/websocket/content.gateway';
import { FilesModule } from '@modules/files/files.module';
import { TransactionService } from '@common/services/transaction.service';
import { ContentProcessorService } from './services/content-processor.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }]),
    FilesModule,
  ],
  controllers: [ContentController],
  providers: [
    ContentService,
    ContentGateway,
    TransactionService,
    ContentProcessorService,
  ],
  exports: [ContentService],
})
export class ContentModule {}
