/**
 * Structured Error Tracker — WebWaka 1.0.1
 * Sprint 2, Task 2.1
 *
 * Cloudflare Workers-compatible structured logging for error tracking.
 * Outputs JSON to console.error (picked up by Cloudflare Logpush).
 *
 * Platform Invariants:
 *   T3 — tenant_id included in error context (never user PII)
 *   T10 — continuity-friendly structured output
 */

export interface ErrorContext {
  route: string;
  method: string;
  tenantId?: string;
  userId?: string;
  requestId?: string;
  environment?: string;
}

export interface StructuredErrorLog {
  level: 'error' | 'warn' | 'fatal';
  service: string;
  timestamp: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context: ErrorContext;
}

export function createStructuredError(
  err: Error | unknown,
  context: ErrorContext,
  level: 'error' | 'warn' | 'fatal' = 'error',
): StructuredErrorLog {
  const error = err instanceof Error ? err : new Error(String(err));

  return {
    level,
    service: 'webwaka-api',
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: level === 'fatal' ? error.stack : undefined,
    },
    context: {
      route: context.route,
      method: context.method,
      tenantId: context.tenantId,
      userId: context.userId,
      requestId: context.requestId,
      environment: context.environment,
    },
  };
}

export function logStructuredError(
  err: Error | unknown,
  context: ErrorContext,
  level: 'error' | 'warn' | 'fatal' = 'error',
): void {
  const structured = createStructuredError(err, context, level);
  console.error(JSON.stringify(structured));
}

export function createRequestId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'req_';
  for (let i = 0; i < 16; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
