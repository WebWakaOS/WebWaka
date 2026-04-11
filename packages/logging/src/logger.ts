import type { Logger, LogLevel, LogContext, LogEntry } from './types.js';
import { maskPII } from './pii.js';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

interface LoggerOptions {
  readonly service: string;
  readonly level?: LogLevel;
  readonly maskPii?: boolean;
  readonly defaultContext?: LogContext;
}

function formatEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

export function createLogger(options: LoggerOptions): Logger {
  const minLevel = LEVEL_PRIORITY[options.level ?? 'info'];
  const shouldMask = options.maskPii !== false;
  const baseCtx = options.defaultContext ?? {};

  function emit(level: LogLevel, msg: string, ctx?: LogContext, err?: unknown): void {
    if (LEVEL_PRIORITY[level] < minLevel) return;

    const mergedCtx = { ...baseCtx, ...ctx };
    const safeMsg = shouldMask ? maskPII(msg) : msg;

    const safeCtxEntries: Array<[string, string | number | boolean]> = [];
    for (const [k, v] of Object.entries(mergedCtx)) {
      if (v === undefined) continue;
      safeCtxEntries.push([k, shouldMask && typeof v === 'string' ? maskPII(v) : v]);
    }
    const safeCtx = Object.fromEntries(safeCtxEntries) as LogContext;

    const hasCtx = Object.keys(safeCtx).length > 0;
    const rawErrMsg = err instanceof Error ? err.message : err ? String(err) : undefined;
    const errMsg = rawErrMsg !== undefined && shouldMask ? maskPII(rawErrMsg) : rawErrMsg;
    const errStack = err instanceof Error ? err.stack : undefined;

    const entry: LogEntry = Object.assign(
      { level, ts: new Date().toISOString(), service: options.service, msg: safeMsg },
      hasCtx ? { ctx: safeCtx } : {},
      errMsg !== undefined ? { err: errMsg } : {},
      errStack !== undefined ? { stack: errStack } : {},
    );

    const line = formatEntry(entry);

    switch (level) {
      case 'error':
        console.error(line);
        break;
      case 'warn':
        console.warn(line);
        break;
      case 'debug':
        console.debug(line);
        break;
      default:
        console.log(line);
    }
  }

  const logger: Logger = {
    debug(msg: string, ctx?: LogContext) {
      emit('debug', msg, ctx);
    },
    info(msg: string, ctx?: LogContext) {
      emit('info', msg, ctx);
    },
    warn(msg: string, ctx?: LogContext) {
      emit('warn', msg, ctx);
    },
    error(msg: string, err?: unknown, ctx?: LogContext) {
      emit('error', msg, ctx, err);
    },
    child(childCtx: LogContext): Logger {
      return createLogger({
        ...options,
        defaultContext: { ...baseCtx, ...childCtx },
      });
    },
  };

  return logger;
}
