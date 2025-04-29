// src/modules/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '@common/cache/cache.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly cacheService: CacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('app.jwt.secret'),
    });
  }

  /**
   * Validate JWT payload:
   * - Check if jti is still present in Redis
   */
  async validate(payload: any) {
    const jti = payload.jti;
    const exists = await this.cacheService.get(`jti:${jti}`);
    if (!exists) {
      throw new UnauthorizedException('Token revoked');
    }
    // attach user info & jti to req.user
    return { userId: payload.sub, role: payload.role, jti };
  }
}
