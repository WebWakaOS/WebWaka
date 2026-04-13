import type { Context, Next } from 'hono';
import type { Env } from '../env.js';

interface RequestMetrics {
  method: string;
  path: string;
  status: number;
  duration_ms: number;
  timestamp: string;
  request_id: string;
  error?: string;
}

const ERROR_THRESHOLD_PER_MINUTE = 50;
const LATENCY_THRESHOLD_MS = 5000;
const ALERT_COOLDOWN_MS = 60_000;

let errorCountWindow: { count: number; windowStart: number } = {
  count: 0,
  windowStart: Date.now(),
};
let lastAlertSent = 0;

function resetWindowIfNeeded(): void {
  const now = Date.now();
  if (now - errorCountWindow.windowStart > 60_000) {
    errorCountWindow = { count: 0, windowStart: now };
  }
}

export async function monitoringMiddleware(
  c: Context<{ Bindings: Env }>,
  next: Next,
): Promise<void> {
  const start = Date.now();
  const requestId = c.get('requestId') ?? 'unknown';

  try {
    await next();
  } finally {
    const duration = Date.now() - start;
    const status = c.res.status;
    const path = new URL(c.req.url).pathname;

    const metrics: RequestMetrics = {
      method: c.req.method,
      path,
      status,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
      request_id: requestId,
    };

    c.header('X-Response-Time', `${duration}ms`);

    if (status >= 500) {
      resetWindowIfNeeded();
      errorCountWindow.count++;
      metrics.error = `Server error ${status}`;
      console.error(JSON.stringify({ level: 'error', type: 'request_error', ...metrics }));
    }

    if (duration > LATENCY_THRESHOLD_MS) {
      console.warn(JSON.stringify({ level: 'warn', type: 'slow_request', ...metrics }));
    }

    const now = Date.now();
    if (
      status >= 500 &&
      errorCountWindow.count >= ERROR_THRESHOLD_PER_MINUTE &&
      now - lastAlertSent > ALERT_COOLDOWN_MS
    ) {
      lastAlertSent = now;
      console.error(
        JSON.stringify({
          level: 'critical',
          type: 'error_rate_spike',
          errors_in_window: errorCountWindow.count,
          threshold: ERROR_THRESHOLD_PER_MINUTE,
          message: `Error rate exceeded ${ERROR_THRESHOLD_PER_MINUTE}/min — alerting triggered`,
        }),
      );

      if (c.env.ALERT_WEBHOOK_URL) {
        const webhookUrl = c.env.ALERT_WEBHOOK_URL;
        const payload = JSON.stringify({
          text: `[WebWaka API] Error rate spike: ${errorCountWindow.count} errors in last minute. Environment: ${c.env.ENVIRONMENT ?? 'unknown'}`,
          severity: 'critical',
          timestamp: new Date().toISOString(),
        });
        c.executionCtx?.waitUntil?.(
          fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
          }).catch(() => {}),
        );
      }
    }
  }
}

export function getErrorRateMetrics(): { count: number; windowStart: number } {
  resetWindowIfNeeded();
  return { ...errorCountWindow };
}
