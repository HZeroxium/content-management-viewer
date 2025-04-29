// src/common/pipes/validation.pipe.ts
import { ValidationPipe as NestValidationPipe } from '@nestjs/common';

/**
 * Global validation pipe:
 * - whitelist: strips any properties not in the DTO
 * - forbidNonWhitelisted: throws error if extra props are provided
 * - transform: auto-converts payloads to DTO instances (e.g., string → number)
 */
export const ValidationPipe = new NestValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});
