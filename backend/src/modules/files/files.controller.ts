// // /src/modules/files/files.controller.ts

// import {
//   Controller,
//   Post,
//   UseGuards,
//   UseInterceptors,
//   UploadedFile,
// } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import * as multer from 'multer';
// import { FilesService } from './files.service';
// import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
// import { RolesGuard } from '@common/guards/roles.guard';
// import { Roles } from '@common/decorators/roles.decorator';

// @Controller('files')
// @UseGuards(JwtAuthGuard, RolesGuard)
// export class FilesController {
//   constructor(private readonly filesService: FilesService) {}

//   /**
//    * POST /files/upload
//    * Editors & Admins only
//    */
//   @Roles('editor', 'admin')
//   @Post('upload')
//   @UseInterceptors(
//     FileInterceptor('file', {
//       storage: multer.memoryStorage(),
//       limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
//     }),
//   )
//   upload(@UploadedFile() file: Express.Multer.File) {
//     return this.filesService.uploadFile(file);
//   }
// }
