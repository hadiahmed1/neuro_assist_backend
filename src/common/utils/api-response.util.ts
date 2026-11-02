import { ApiResponseEnvelope } from '../interfaces/api-response.interface.js';

export interface EnvelopeOptions<TData> {
  statusCode: number;
  message: string;
  data?: TData | null;
  errors?: unknown[];
  path: string;
}

/**
 * Builds the standard response envelope. This is the single place
 * where the wire format is defined; both the global response
 * interceptor and the global exception filter delegate to it.
 */
export function createEnvelope<TData>(options: EnvelopeOptions<TData>): ApiResponseEnvelope<TData> {
  const envelope: ApiResponseEnvelope<TData> = {
    success: options.statusCode < 400,
    statusCode: options.statusCode,
    message: options.message,
    data: options.data ?? null,
    timestamp: new Date().toISOString(),
    path: options.path,
  };

  if (options.errors?.length) {
    envelope.errors = options.errors;
  }

  return envelope;
}
