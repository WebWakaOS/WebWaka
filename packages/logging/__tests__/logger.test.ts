import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLogger } from '../src/logger.js';

describe('@webwaka/logging', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('createLogger', () => {
    it('emits structured JSON to console.log for info level', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logger = createLogger({ service: 'test-svc' });

      logger.info('Request processed');

      expect(spy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(spy.mock.calls[0]![0] as string);
      expect(parsed.level).toBe('info');
      expect(parsed.service).toBe('test-svc');
      expect(parsed.msg).toBe('Request processed');
      expect(parsed.ts).toBeDefined();
    });

    it('emits to console.error for error level', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const logger = createLogger({ service: 'test-svc' });

      logger.error('Something broke', new Error('boom'));

      expect(spy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(spy.mock.calls[0]![0] as string);
      expect(parsed.level).toBe('error');
      expect(parsed.err).toBe('boom');
      expect(parsed.stack).toContain('Error: boom');
    });

    it('emits to console.warn for warn level', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const logger = createLogger({ service: 'test-svc' });

      logger.warn('Deprecation notice');

      expect(spy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(spy.mock.calls[0]![0] as string);
      expect(parsed.level).toBe('warn');
    });

    it('suppresses debug when level is info', () => {
      const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      const logger = createLogger({ service: 'test-svc', level: 'info' });

      logger.debug('Verbose detail');

      expect(spy).not.toHaveBeenCalled();
    });

    it('emits debug when level is debug', () => {
      const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      const logger = createLogger({ service: 'test-svc', level: 'debug' });

      logger.debug('Verbose detail');

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('includes context fields in output', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logger = createLogger({ service: 'api' });

      logger.info('Handled request', { tenantId: 'tn_001', requestId: 'req_abc' });

      const parsed = JSON.parse(spy.mock.calls[0]![0] as string);
      expect(parsed.ctx.tenantId).toBe('tn_001');
      expect(parsed.ctx.requestId).toBe('req_abc');
    });

    it('omits ctx field when no context is provided', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logger = createLogger({ service: 'api' });

      logger.info('No context');

      const parsed = JSON.parse(spy.mock.calls[0]![0] as string);
      expect(parsed.ctx).toBeUndefined();
    });
  });

  describe('child logger', () => {
    it('merges parent and child context', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const parent = createLogger({
        service: 'api',
        defaultContext: { tenantId: 'tn_001' },
      });
      const child = parent.child({ requestId: 'req_xyz' });

      child.info('Child log');

      const parsed = JSON.parse(spy.mock.calls[0]![0] as string);
      expect(parsed.ctx.tenantId).toBe('tn_001');
      expect(parsed.ctx.requestId).toBe('req_xyz');
    });

    it('child context overrides parent context', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const parent = createLogger({
        service: 'api',
        defaultContext: { tenantId: 'tn_001' },
      });
      const child = parent.child({ tenantId: 'tn_002' });

      child.info('Overridden');

      const parsed = JSON.parse(spy.mock.calls[0]![0] as string);
      expect(parsed.ctx.tenantId).toBe('tn_002');
    });
  });

  describe('PII masking', () => {
    it('masks email addresses in messages', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logger = createLogger({ service: 'api' });

      logger.info('User john@example.com logged in');

      const parsed = JSON.parse(spy.mock.calls[0]![0] as string);
      expect(parsed.msg).toBe('User [EMAIL_REDACTED] logged in');
      expect(parsed.msg).not.toContain('john@example.com');
    });

    it('masks phone numbers in messages', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logger = createLogger({ service: 'api' });

      logger.info('SMS sent to +2348012345678');

      const parsed = JSON.parse(spy.mock.calls[0]![0] as string);
      expect(parsed.msg).toBe('SMS sent to [PHONE_REDACTED]');
    });

    it('masks IP addresses in messages', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logger = createLogger({ service: 'api' });

      logger.info('Request from 192.168.1.100');

      const parsed = JSON.parse(spy.mock.calls[0]![0] as string);
      expect(parsed.msg).toBe('Request from 192.168.*.*');
    });

    it('skips masking when maskPii is false', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logger = createLogger({ service: 'api', maskPii: false });

      logger.info('User john@example.com logged in');

      const parsed = JSON.parse(spy.mock.calls[0]![0] as string);
      expect(parsed.msg).toBe('User john@example.com logged in');
    });

    it('masks PII in context string values', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logger = createLogger({ service: 'api' });

      logger.info('User action', { email: 'john@example.com', userId: 'usr_123' });

      const parsed = JSON.parse(spy.mock.calls[0]![0] as string);
      expect(parsed.ctx.email).toBe('[EMAIL_REDACTED]');
      expect(parsed.ctx.userId).toBe('usr_123');
    });

    it('masks PII in error messages', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const logger = createLogger({ service: 'api' });

      logger.error('Failed', new Error('User john@example.com not found'));

      const parsed = JSON.parse(spy.mock.calls[0]![0] as string);
      expect(parsed.err).toBe('User [EMAIL_REDACTED] not found');
    });
  });

  describe('error handling', () => {
    it('handles non-Error objects as err', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const logger = createLogger({ service: 'api' });

      logger.error('Failed', 'string-error');

      const parsed = JSON.parse(spy.mock.calls[0]![0] as string);
      expect(parsed.err).toBe('string-error');
      expect(parsed.stack).toBeUndefined();
    });

    it('handles undefined error gracefully', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const logger = createLogger({ service: 'api' });

      logger.error('Failed');

      const parsed = JSON.parse(spy.mock.calls[0]![0] as string);
      expect(parsed.err).toBeUndefined();
    });
  });
});
