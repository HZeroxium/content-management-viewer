// src/config/configuration.ts
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  environment: process.env.NODE_ENV,
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,

  mongo: {
    uri:
      process.env.MONGO_URI || 'mongodb://localhost:27017/content-management',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  spaces: {
    endpoint: process.env.SPACES_ENDPOINT,
    key: process.env.SPACES_KEY,
    secret: process.env.SPACES_SECRET,
    bucket: process.env.SPACES_BUCKET,
  },
}));
