/**
 * Standard wire format for every API response, success or error.
 *
 * Built exclusively through `createEnvelope()` so success
 * (ResponseInterceptor) and failure (AllExceptionsFilter) paths
 * can never drift apart.
 */
export interface ApiResponseEnvelope<TData = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  /** Route payload; `null` when there is nothing to return. */
  data: TData | null;
  /** Structured validation details, only set for multi-message errors. */
  errors?: unknown[];
  /** ISO-8601 UTC instant at which the response was built. */
  timestamp: string;
  /** Request path the response belongs to. */
  path: string;
}
