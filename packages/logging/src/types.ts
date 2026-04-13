export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  readonly tenantId?: string;
  readonly userId?: string;
  readonly requestId?: string;
  readonly workspaceId?: string;
  readonly [key: string]: string | number | boolean | undefined;
}

export interface LogEntry {
  readonly level: LogLevel;
  readonly ts: string;
  readonly service: string;
  readonly msg: string;
  readonly ctx?: LogContext;
  readonly err?: string;
  readonly stack?: string;
}

export interface Logger {
  debug(msg: string, ctx?: LogContext): void;
  info(msg: string, ctx?: LogContext): void;
  warn(msg: string, ctx?: LogContext): void;
  error(msg: string, err?: unknown, ctx?: LogContext): void;
  child(defaultCtx: LogContext): Logger;
}
