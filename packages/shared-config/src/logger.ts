/**
 * Structured Logger Utility (L-1)
 *
 * Provides consistent structured JSON logging across all WebWaka workers.
 * Outputs are captured by Cloudflare's tail worker or Logpush for forwarding
 * to external sinks (Axiom, Datadog, Logtail, etc.).
 *
 * Usage:
 *   import { logger } from '@webwaka/shared-config';
 *   logger.info('User login', { userId: 'usr_123', ip: '1.2.3.4' });
 *   logger.error('Payment failed', { txId: 'tx_abc', error: 'timeout' });
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service?: string;
  request_id?: string;
  tenant_id?: string;
  workspace_id?: string;
  user_id?: string;
  [key: string]: unknown;
}

interface LoggerOptions {
  service: string;
  minLevel?: LogLevel;
}

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export class StructuredLogger {
  private service: string;
  private minLevel: number;
  private context: Record<string, unknown> = {};

  constructor(opts: LoggerOptions) {
    this.service = opts.service;
    this.minLevel = LEVELS[opts.minLevel || 'info'];
  }

  /**
   * Create a child logger with additional context (e.g., request-scoped fields)
   */
  child(context: Record<string, unknown>): StructuredLogger {
    const child = new StructuredLogger({ service: this.service, minLevel: 'debug' });
    child.minLevel = this.minLevel;
    child.context = { ...this.context, ...context };
    return child;
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log('debug', message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.log('error', message, meta);
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    if (LEVELS[level] < this.minLevel) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.service,
      ...this.context,
      ...meta,
    };

    const output = JSON.stringify(entry);

    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      default:
        console.log(output);
    }
  }
}

/**
 * Create a logger instance for a worker service.
 *
 * @example
 * const logger = createLogger('webwaka-api');
 * logger.info('Request received', { path: '/health', method: 'GET' });
 */
export function createLogger(service: string, minLevel: LogLevel = 'info'): StructuredLogger {
  return new StructuredLogger({ service, minLevel });
}
