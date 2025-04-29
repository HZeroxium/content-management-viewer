// src/common/cache/cache.service.ts

import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Redis as RedisClient } from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: RedisClient;

  constructor(private readonly config: ConfigService) {
    // Initialize ioredis with host/port from ConfigService
    this.client = new Redis({
      host: this.config.get<string>('app.redis.host'),
      port: this.config.get<number>('app.redis.port'),
      // you can add password, tls, etc. here if needed
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis error', err);
    });
  }

  /** Set a key with optional TTL (seconds). */
  async set(key: string, value: any, ttlSeconds?: number): Promise<'OK'> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      return this.client.set(key, serialized, 'EX', ttlSeconds);
    }
    return this.client.set(key, serialized);
  }

  /** Get a typed value (or null). */
  async get<T = any>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  /** Delete one or more keys. */
  async del(...keys: string[]): Promise<number> {
    return this.client.del(...keys);
  }

  /** Clean up on shutdown. */
  async onModuleDestroy() {
    await this.client.quit();
  }
}
