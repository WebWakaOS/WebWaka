/**
 * LogDrainTransport tests — Wave 3 C6-2
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogDrainTransport } from './log-drain-transport.js';

describe('LogDrainTransport (C6-2)', () => {
  describe('entry structure', () => {
    it('emits ts, level, event, worker on every entry', async () => {
      const logs: string[] = [];
      vi.spyOn(console, 'log').mockImplementation((v) => logs.push(v));

      const t = new LogDrainTransport({ worker: 'test-worker' });
      t.info('request_completed', { path: '/v1/chat', duration_ms: 100 });
      await t.flush();

      const entry = JSON.parse(logs[0]!);
      expect(entry.ts).toBeTruthy();
      expect(entry.level).toBe('info');
      expect(entry.event).toBe('request_completed');
      expect(entry.worker).toBe('test-worker');
      vi.restoreAllMocks();
    });

    it('P9: duration_ms passes through as integer', async () => {
      const logs: string[] = [];
      vi.spyOn(console, 'log').mockImplementation((v) => logs.push(v));

      const t = new LogDrainTransport({ worker: 'w' });
      t.info('req', { duration_ms: 147 });
      await t.flush();

      const entry = JSON.parse(logs[0]!);
      expect(Number.isInteger(entry.duration_ms)).toBe(true);
      expect(entry.duration_ms).toBe(147);
      vi.restoreAllMocks();
    });
  });

  describe('P8 — secret redaction', () => {
    it('redacts authorization field', async () => {
      const logs: string[] = [];
      vi.spyOn(console, 'log').mockImplementation((v) => logs.push(v));

      const t = new LogDrainTransport({ worker: 'w' });
      t.info('req', { authorization: 'Bearer sk-secret', path: '/api' });
      await t.flush();

      const entry = JSON.parse(logs[0]!);
      expect(entry.authorization).toBe('[REDACTED]');
      expect(entry.path).toBe('/api');
      vi.restoreAllMocks();
    });

    it('redacts apikey field (case-insensitive)', async () => {
      const logs: string[] = [];
      vi.spyOn(console, 'log').mockImplementation((v) => logs.push(v));

      const t = new LogDrainTransport({ worker: 'w' });
      t.info('req', { apiKey: 'sk-do-not-log' });
      await t.flush();

      const entry = JSON.parse(logs[0]!);
      expect(entry.apiKey).toBe('[REDACTED]');
      vi.restoreAllMocks();
    });

    it('does not redact non-sensitive fields', async () => {
      const logs: string[] = [];
      vi.spyOn(console, 'log').mockImplementation((v) => logs.push(v));

      const t = new LogDrainTransport({ worker: 'w' });
      t.info('req', { tenant_id: 'abc', duration_ms: 50 });
      await t.flush();

      const entry = JSON.parse(logs[0]!);
      expect(entry.tenant_id).toBe('abc');
      vi.restoreAllMocks();
    });
  });

  describe('level filtering', () => {
    it('debug messages are filtered out when minLevel=info', async () => {
      const logs: string[] = [];
      vi.spyOn(console, 'log').mockImplementation((v) => logs.push(v));

      const t = new LogDrainTransport({ worker: 'w', minLevel: 'info' });
      t.debug('noisy', { foo: 1 });
      await t.flush();

      expect(logs).toHaveLength(0);
      vi.restoreAllMocks();
    });

    it('info messages pass minLevel=info', async () => {
      const logs: string[] = [];
      vi.spyOn(console, 'log').mockImplementation((v) => logs.push(v));

      const t = new LogDrainTransport({ worker: 'w', minLevel: 'info' });
      t.info('hello', {});
      await t.flush();

      expect(logs).toHaveLength(1);
      vi.restoreAllMocks();
    });
  });

  describe('batching', () => {
    it('does not flush until maxBatchSize reached or flush() called', async () => {
      const logs: string[] = [];
      vi.spyOn(console, 'log').mockImplementation((v) => logs.push(v));

      const t = new LogDrainTransport({ worker: 'w', maxBatchSize: 5 });
      t.info('a', {}); t.info('b', {}); t.info('c', {});
      // Not yet flushed
      expect(logs).toHaveLength(0);

      await t.flush();
      expect(logs).toHaveLength(3);
      vi.restoreAllMocks();
    });

    it('flush() clears the batch', async () => {
      const logs: string[] = [];
      vi.spyOn(console, 'log').mockImplementation((v) => logs.push(v));

      const t = new LogDrainTransport({ worker: 'w' });
      t.info('first', {});
      await t.flush();
      const countAfterFirst = logs.length;

      await t.flush(); // second flush — batch is empty
      expect(logs.length).toBe(countAfterFirst); // nothing new
      vi.restoreAllMocks();
    });
  });
});
