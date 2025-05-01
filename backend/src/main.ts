// /src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@common/pipes/validation.pipe';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1) Global validation
  app.useGlobalPipes(ValidationPipe);

  // 2) Global error filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // 3) Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
