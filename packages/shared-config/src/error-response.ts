/**
 * ARC-06: Standardized error response schema for all WebWaka API endpoints.
 *
 * Every error response follows the same shape:
 * {
 *   error: string,       // machine-readable error code
 *   message: string,     // human-readable description
 *   details?: unknown,   // optional validation details / context
 *   request_id?: string  // optional correlation ID (ARC-19, future)
 * }
 *
 * NOTE: ErrorCode is intentionally a `const` object (not a TS enum) so that it
 * compiles cleanly with any transform (esbuild, oxc, SWC, tsc) and survives
 * Vite 8 SSR module evaluation without temporal dead zone issues.
 */

export const ErrorCode = {
  BadRequest: 'bad_request',
  Unauthorized: 'unauthorized',
  Forbidden: 'forbidden',
  NotFound: 'not_found',
  Conflict: 'conflict',
  ValidationFailed: 'validation_failed',
  RateLimitExceeded: 'rate_limit_exceeded',
  PayloadTooLarge: 'payload_too_large',
  InternalError: 'internal_error',
  ServiceUnavailable: 'service_unavailable',
} as const;

// Derive a union type so `ErrorCode[keyof typeof ErrorCode]` works as a type annotation
export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: unknown;
  request_id?: string;
}

export function errorResponse(
  code: ErrorCodeValue,
  message: string,
  details?: unknown,
  requestId?: string,
): ApiErrorResponse {
  const resp: ApiErrorResponse = { error: code, message };
  if (details !== undefined) resp.details = details;
  if (requestId) resp.request_id = requestId;
  return resp;
}
