// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { environmentValidationSchema } from './config/env.validation';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from './common/cache/cache.module';
import { ContentGateway } from './websocket/content.gateway';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ContentModule } from './modules/content/content.module';
// import { FilesModule } from './modules/files/files.module';

@Module({
  imports: [
    // 1) Load and validate .env
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: environmentValidationSchema,
    }),

    // 2) Now you can use ConfigService in any module
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('app.mongo.uri'),
        // you can add options here
      }),
      inject: [ConfigService],
    }),

    // Core modules
    CacheModule,
    UsersModule,
    AuthModule,
    ContentModule,
    // FilesModule,
  ],
  providers: [ContentGateway],
})
export class AppModule {}
