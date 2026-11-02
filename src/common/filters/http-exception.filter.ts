import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { createEnvelope } from '../utils/api-response.util.js';

interface NormalizedError {
  statusCode: number;
  message: string;
  errors?: unknown[];
}

/**
 * Formats every uncaught error, in the same envelope used for
 * successful responses, so clients always parse one predictable
 * wire format.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const error = this.normalize(exception);

    if (error.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${error.statusCode}: ${error.message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(error.statusCode).json(
      createEnvelope({
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors,
        path: request.url,
      }),
    );
  }

  /**
   * Maps any thrown value to the parts the envelope needs:
   * known Nest `HttpException`s expose their status and payload,
   * everything degrades to a 500.
   */
  private normalize(exception: unknown): NormalizedError {
    if (exception instanceof HttpException) {
      return { statusCode: exception.getStatus(), ...this.resolveMessage(exception.getResponse()) };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected internal server error occurred.',
    };
  }

  private resolveMessage(payload: string | object): { message: string; errors?: unknown[] } {
    if (typeof payload === 'string') {
      return { message: payload };
    }

    const { message, error } = payload as { message?: unknown; error?: string };

    if (Array.isArray(message)) {
      // class-validator style payload: an array of validation messages.
      return { message: message.join('; '), errors: message };
    }

    if (typeof message === 'string' && message.length > 0) {
      return { message };
    }

    return { message: error ?? 'An unexpected error occurred.' };
  }
}
