// // /src/modules/files/files.service.ts

// import { Injectable, InternalServerErrorException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import { v4 as uuidv4 } from 'uuid';

// @Injectable()
// export class FilesService {
//   private readonly s3: S3Client;
//   private readonly bucket: string;
//   private readonly endpoint: string;

//   constructor(private cfg: ConfigService) {
//     this.bucket = this.cfg.get<string>('SPACES_BUCKET');
//     this.endpoint = this.cfg.get<string>('SPACES_ENDPOINT');
//     this.s3 = new S3Client({
//       region: this.cfg.get<string>('SPACES_REGION') || 'us-east-1',
//       endpoint: this.endpoint,
//       credentials: {
//         accessKeyId: this.cfg.get<string>('SPACES_KEY'),
//         secretAccessKey: this.cfg.get<string>('SPACES_SECRET'),
//       },
//     });
//   }

//   /** Upload buffer to DO Spaces & return public URL */
//   async uploadFile(file: Express.Multer.File): Promise<{ url: string }> {
//     const key = `${uuidv4()}_${file.originalname}`;
//     try {
//       await this.s3.send(
//         new PutObjectCommand({
//           Bucket: this.bucket,
//           Key: key,
//           Body: file.buffer,
//           ContentType: file.mimetype,
//           ACL: 'public-read',
//         }),
//       );
//     } catch (err) {
//       throw new InternalServerErrorException('Error uploading file to Spaces');
//     }
//     return { url: `${this.endpoint}/${this.bucket}/${key}` };
//   }
// }
