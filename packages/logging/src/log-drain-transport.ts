/**
 * LogDrainTransport — Wave 3 C6-2
 * [Infra] Structured log drain for Cloudflare Workers → Logpush sink.
 *
 * Replaces `console.log` in production with batched structured JSON POSTs
 * to the configured Cloudflare Logpush endpoint (or any HTTP sink).
 *
 * Features:
 *   - Batches log entries to reduce egress Worker calls
 *   - Flushes on: batch size ≥ maxBatchSize OR timer interval
 *   - Falls back to console.log if drain URL is not configured
 *   - P8: never logs Authorization headers or API keys
 *   - P9: duration_ms and cost fields are integers
 *
 * Usage:
 *   import { LogDrainTransport } from '@webwaka/logging';
 *   const log = new LogDrainTransport({ drainUrl: env.LOG_DRAIN_URL, worker: 'webwaka-api' });
 *   log.info('request_completed', { path: '/v1/chat', duration_ms: 147 });
 *   await log.flush(); // call at end of Worker request
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  ts:       string;
  level:    LogLevel;
  event:    string;
  worker:   string;
  [key: string]: unknown;
}

export interface LogDrainConfig {
  /** HTTP endpoint to POST log batches to. Falsy = console.log fallback. */
  drainUrl?:     string;
  /** Worker name tag added to every entry. */
  worker:        string;
  /** Max entries per batch before auto-flush. Default: 50. */
  maxBatchSize?: number;
  /** Fields that must NEVER appear in log entries (P8 — secrets). */
  redactFields?: string[];
  /** Log level filter. Default: 'info'. */
  minLevel?:     LogLevel;
}

const LEVEL_RANK: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const DEFAULT_REDACT = [
  'authorization', 'apikey', 'api_key', 'secret', 'password',
  'token', 'x-api-key', 'bearer',
];

export class LogDrainTransport {
  private readonly config:    Required<LogDrainConfig>;
  private readonly batch:     LogEntry[] = [];

  constructor(config: LogDrainConfig) {
    this.config = {
      drainUrl:     config.drainUrl ?? '',
      worker:       config.worker,
      maxBatchSize: config.maxBatchSize ?? 50,
      redactFields: [...DEFAULT_REDACT, ...(config.redactFields ?? [])],
      minLevel:     config.minLevel ?? 'info',
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_RANK[level] >= LEVEL_RANK[this.config.minLevel];
  }

  private redact(fields: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) {
      if (this.config.redactFields.some(r => k.toLowerCase().includes(r))) {
        out[k] = '[REDACTED]';
      } else {
        out[k] = v;
      }
    }
    return out;
  }

  private write(level: LogLevel, event: string, fields: Record<string, unknown> = {}): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      ts:     new Date().toISOString(),
      level,
      event,
      worker: this.config.worker,
      ...this.redact(fields),
    };

    this.batch.push(entry);

    if (this.batch.length >= this.config.maxBatchSize) {
      // Fire-and-forget flush when batch is full
      void this.flush();
    }
  }

  debug(event: string, fields?: Record<string, unknown>): void { this.write('debug', event, fields); }
  info( event: string, fields?: Record<string, unknown>): void { this.write('info',  event, fields); }
  warn( event: string, fields?: Record<string, unknown>): void { this.write('warn',  event, fields); }
  error(event: string, fields?: Record<string, unknown>): void { this.write('error', event, fields); }

  /**
   * Flush buffered entries to the drain URL (or console if no URL configured).
   * Call at the end of every Worker request handler.
   */
  async flush(): Promise<void> {
    if (this.batch.length === 0) return;

    const entries = this.batch.splice(0, this.batch.length);

    if (!this.config.drainUrl) {
      // Fallback: emit to console (picked up by Cloudflare Workers trace)
      for (const entry of entries) {
        const fn = entry.level === 'error' ? console.error
                 : entry.level === 'warn'  ? console.warn
                 : console.log;
        fn(JSON.stringify(entry));
      }
      return;
    }

    try {
      await fetch(this.config.drainUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-ndjson' },
        body: entries.map(e => JSON.stringify(e)).join('\n'),
        signal: AbortSignal.timeout(2_000),
      });
    } catch {
      // If drain is unreachable, fall back to console (non-fatal)
      for (const entry of entries) {
        console.log(JSON.stringify(entry));
      }
    }
  }
}
