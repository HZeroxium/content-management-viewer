// src/common/cache/cache.module.ts

import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';

@Global() // makes CacheService injectable application-wide
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
