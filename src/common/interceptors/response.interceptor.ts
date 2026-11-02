import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import type { Request, Response } from 'express';
import { ApiResponseEnvelope } from '../interfaces/api-response.interface.js';
import { createEnvelope } from '../utils/api-response.util.js';
import { API_RESPONSE_MESSAGE_METADATA } from '../decorators/api-response-message.decorator.js';
import { SKIP_RESPONSE_WRAP_METADATA } from '../decorators/skip-response-wrap.decorator.js';

/** Fallback message when a route does not declare one via `@ApiResponseMessage`. */
const DEFAULT_MESSAGES: Record<string, string> = {
  GET: 'Request successful.',
  POST: 'Resource created successfully.',
  PUT: 'Resource updated successfully.',
  PATCH: 'Resource updated successfully.',
  DELETE: 'Resource deleted successfully.',
};

const DEFAULT_FALLBACK_MESSAGE = 'Request successful.';

/**
 * Wraps every successful handler response in the structured
 * `ApiResponseEnvelope` format, unless the route opts out via
 * `@SkipResponseWrap()`.
 */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponseEnvelope<T> | T>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponseEnvelope<T> | T> {
    if (this.isSkipped(context)) {
      return next.handle();
    }

    return next.handle().pipe(map((data) => this.envelope(data, context)));
  }

  private isSkipped(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(SKIP_RESPONSE_WRAP_METADATA, [
      context.getHandler(),
      context.getClass(),
    ]) === true;
  }

  private envelope(data: T, context: ExecutionContext): ApiResponseEnvelope<T> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();

    const customMessage = this.reflector.getAllAndOverride<string>(
      API_RESPONSE_MESSAGE_METADATA,
      [context.getHandler(), context.getClass()],
    );

    return createEnvelope({
      statusCode: http.getResponse<Response>().statusCode,
      message: customMessage ?? DEFAULT_MESSAGES[request.method] ?? DEFAULT_FALLBACK_MESSAGE,
      data,
      path: request.url,
    });
  }
}
