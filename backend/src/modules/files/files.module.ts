// /src/modules/files/files.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { File, FileSchema } from './schemas/file.schema';
import { S3StorageService } from '@common/services/storage.service';
import { FileValidatorService } from './services/file-validator.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  providers: [FilesService, S3StorageService, FileValidatorService],
  controllers: [FilesController],
  exports: [FilesService],
})
export class FilesModule {}
