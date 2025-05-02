// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Catches all HttpExceptions and formats the response JSON as:
 * {
 *   statusCode: number,
 *   timestamp: string,
 *   path: string,
 *   error: string | record
 * }
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = exception.getResponse();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      // payload may be string or object with message/details
      error:
        typeof payload === 'string'
          ? payload
          : (payload as any).message || 'An unexpected error occurred',
    };

    response.status(status).json(errorResponse);
  }
}
