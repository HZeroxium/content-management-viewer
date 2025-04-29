// /src/modules/files/files.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { File, FileSchema } from './schemas/file.schema';

@Module({
  imports: [
    ConfigModule, // to read SPACES_* env vars via ConfigService
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  providers: [FilesService],
  controllers: [FilesController],
  exports: [FilesService], // export to allow other modules to use it
})
export class FilesModule {}
