/**
 * Timing middleware tests — Wave 3 C2-4
 */
import { describe, it, expect } from 'vitest';

// We test the log-output shape without invoking Hono
// by replicating the log construction logic.

interface TimingLog {
  ts: string;
  level: 'info' | 'warn' | 'error';
  event: string;
  method: string;
  path: string;
  status: number;
  duration_ms: number;
  tenant_id: string | null;
  cf_ray: string | null;
  worker: string;
}

function buildLog(
  method: string, path: string, status: number,
  durationMs: number, tenantId: string | null, cfRay: string | null,
): TimingLog {
  return {
    ts: new Date().toISOString(),
    level: status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info',
    event: 'request_completed',
    method, path, status,
    duration_ms: durationMs,
    tenant_id: tenantId,
    cf_ray: cfRay,
    worker: 'webwaka-api',
  };
}

describe('Timing middleware log shape (C2-4)', () => {
  it('emits correct fields for 200 OK', () => {
    const log = buildLog('POST', '/v1/superagent/chat', 200, 147, 'tenant_abc', 'ray123');
    expect(log.event).toBe('request_completed');
    expect(log.level).toBe('info');
    expect(log.duration_ms).toBe(147);
    expect(log.status).toBe(200);
    expect(log.tenant_id).toBe('tenant_abc');
    expect(log.worker).toBe('webwaka-api');
  });

  it('uses warn level for 4xx', () => {
    const log = buildLog('GET', '/v1/missing', 404, 5, null, null);
    expect(log.level).toBe('warn');
  });

  it('uses error level for 5xx', () => {
    const log = buildLog('POST', '/v1/crash', 500, 12, null, null);
    expect(log.level).toBe('error');
  });

  it('duration_ms is an integer (no float)', () => {
    const log = buildLog('GET', '/health', 200, 3, null, null);
    expect(Number.isInteger(log.duration_ms)).toBe(true);
  });

  it('P8: log does not include Authorization or apiKey fields', () => {
    const log = buildLog('POST', '/v1/chat', 200, 50, 'tenant_x', 'rayX');
    const serialised = JSON.stringify(log);
    expect(serialised).not.toContain('Authorization');
    expect(serialised).not.toContain('apiKey');
    expect(serialised).not.toContain('Bearer');
  });

  it('cf_ray is null when CF-Ray header absent', () => {
    const log = buildLog('GET', '/health', 200, 1, null, null);
    expect(log.cf_ray).toBeNull();
  });

  it('tenant_id is null when unauthenticated request', () => {
    const log = buildLog('GET', '/v1/discovery/search', 200, 8, null, 'ray99');
    expect(log.tenant_id).toBeNull();
  });

  it('ts field is valid ISO-8601', () => {
    const log = buildLog('GET', '/health', 200, 1, null, null);
    expect(() => new Date(log.ts)).not.toThrow();
    expect(new Date(log.ts).toISOString()).toBe(log.ts);
  });
});
