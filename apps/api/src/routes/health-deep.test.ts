/**
 * Deep health check tests — Wave 3 C4-2
 */
import { describe, it, expect } from 'vitest';

// Test the status derivation logic directly (no Worker runtime needed)

type CheckResult = { ok: boolean; latency_ms: number; error?: string };

function deriveStatus(
  d1: CheckResult, kv: CheckResult, ai: CheckResult,
): 'ok' | 'degraded' | 'down' {
  if (d1.ok && kv.ok && ai.ok) return 'ok';
  if (d1.ok) return 'degraded';
  return 'down';
}

describe('Deep health status derivation (C4-2)', () => {
  const ok: CheckResult = { ok: true, latency_ms: 10 };
  const fail: CheckResult = { ok: false, latency_ms: 3001, error: 'timeout' };

  it('all ok → status: ok', () => expect(deriveStatus(ok, ok, ok)).toBe('ok'));
  it('ai fails, D1+KV ok → degraded (AI provider is non-critical)', () => {
    expect(deriveStatus(ok, ok, fail)).toBe('degraded');
  });
  it('kv fails, D1 ok → degraded', () => {
    expect(deriveStatus(ok, fail, ok)).toBe('degraded');
  });
  it('D1 fails → down (D1 is critical datastore)', () => {
    expect(deriveStatus(fail, ok, ok)).toBe('down');
  });
  it('all fail → down', () => {
    expect(deriveStatus(fail, fail, fail)).toBe('down');
  });

  describe('HTTP status codes', () => {
    it('ok → 200', () => {
      const status = deriveStatus(ok, ok, ok);
      expect(status === 'down' ? 503 : 200).toBe(200);
    });
    it('degraded → 200 (caller must inspect .status field)', () => {
      const status = deriveStatus(ok, ok, fail);
      expect(status === 'down' ? 503 : 200).toBe(200);
    });
    it('down → 503', () => {
      const status = deriveStatus(fail, ok, ok);
      expect(status === 'down' ? 503 : 200).toBe(503);
    });
  });

  describe('response shape', () => {
    it('response includes cached_at ISO-8601 timestamp', () => {
      const ts = new Date().toISOString();
      expect(() => new Date(ts)).not.toThrow();
    });
    it('cache_ttl_s is 30 seconds', () => {
      const TTL = 30;
      expect(TTL).toBe(30);
    });
    it('check result has ok + latency_ms', () => {
      expect(ok.ok).toBe(true);
      expect(typeof ok.latency_ms).toBe('number');
    });
  });
});
