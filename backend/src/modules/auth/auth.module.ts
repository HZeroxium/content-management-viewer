// src/modules/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '@users/users.module';
import { CacheModule } from '@common/cache/cache.module';

@Module({
  imports: [
    UsersModule, // for UsersService & password hashing
    CacheModule, // for CacheService
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService) => ({
        secret: cs.get<string>('app.jwt.secret'),
        signOptions: { expiresIn: cs.get<string>('app.jwt.expiresIn') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
