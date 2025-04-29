// src/config/env.validation.ts

import * as Joi from 'joi';

export const environmentValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  MONGO_URI: Joi.string().uri().required(),

  REDIS_HOST: Joi.string().hostname().required(),
  REDIS_PORT: Joi.number().default(6379),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('3600s'),

  SPACES_ENDPOINT: Joi.string().uri().required(),
  SPACES_KEY: Joi.string().required(),
  SPACES_SECRET: Joi.string().required(),
  SPACES_BUCKET: Joi.string().required(),
});
