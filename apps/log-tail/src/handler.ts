/**
 * WebWaka Log Tail Worker (L-1)
 *
 * A Cloudflare Tail Worker that receives structured log events from all other
 * WebWaka workers and forwards them to a configurable external log sink.
 *
 * Supported sinks (configured via LOG_SINK env var):
 *   - axiom     → Axiom HTTP Ingest API (recommended for CF Workers)
 *   - datadog   → Datadog Logs Intake API
 *   - logtail   → Better Stack (Logtail) HTTP source
 *   - console   → stdout only (default / development)
 *
 * Required env vars per sink:
 *   - LOG_SINK=axiom      + LOG_SINK_TOKEN=<axiom-api-token>   + LOG_SINK_DATASET=<dataset>
 *   - LOG_SINK=datadog    + LOG_SINK_TOKEN=<dd-api-key>        + LOG_SINK_DATASET=<dd-tags e.g. env:prod>
 *   - LOG_SINK=logtail    + LOG_SINK_TOKEN=<source-token>
 *   - LOG_SINK=console    (no extra vars needed)
 *
 * Deployment:
 *   wrangler tail --format=json on the api worker, OR configure as a CF Tail Worker
 *   binding in the api wrangler.toml: tail_consumers = [{ service = "log-tail" }]
 *
 * Retention: Axiom free tier = 7 days; Datadog = 15 days; Logtail = 3 days.
 * All meet the 7-day minimum specified in L-1.
 *
 * Reference:
 *   https://developers.cloudflare.com/workers/observability/logging/tail-workers/
 */

export interface LogTailEnv {
  LOG_SINK?: string;        // 'axiom' | 'datadog' | 'logtail' | 'console'
  LOG_SINK_TOKEN?: string;  // API key / bearer token for the sink
  LOG_SINK_DATASET?: string; // Dataset name (Axiom) or tags (Datadog)
  LOG_SINK_URL?: string;    // Override the default ingest URL (optional)
  ENVIRONMENT?: string;     // 'production' | 'staging' | 'development'
}

// ── Cloudflare Tail Worker types ─────────────────────────────────────────────

interface TailEvent {
  readonly scriptName: string;
  readonly outcome: 'ok' | 'exception' | 'exceededCpu' | 'exceededMemory' | 'canceled' | 'unknown';
  readonly exceptions: Array<{ name: string; message: string; timestamp: number }>;
  readonly logs: Array<{ message: unknown[]; level: string; timestamp: number }>;
  readonly eventTimestamp: number;
  readonly event: {
    request?: {
      method: string;
      url: string;
      headers: Record<string, string>;
    };
    scheduledTime?: number;
    cron?: string;
    type: string;
  } | null;
}

// ── Sink implementations ──────────────────────────────────────────────────────

interface SinkPayload {
  events: NormalisedEvent[];
  env: LogTailEnv;
}

interface NormalisedEvent {
  timestamp: string;
  service: string;
  environment: string;
  outcome: string;
  level: string;
  message: string;
  request_method?: string;
  request_url?: string;
  request_id?: string;
  error?: string;
  raw?: unknown;
}

async function sendToAxiom({ events, env }: SinkPayload): Promise<void> {
  const dataset = env.LOG_SINK_DATASET || 'webwaka-logs';
  const url = env.LOG_SINK_URL || `https://api.axiom.co/v1/datasets/${dataset}/ingest`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.LOG_SINK_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(events),
  });

  if (!res.ok) {
    console.error(JSON.stringify({
      event: 'log_drain_error',
      sink: 'axiom',
      status: res.status,
      ts: new Date().toISOString(),
    }));
  }
}

async function sendToDatadog({ events, env }: SinkPayload): Promise<void> {
  const url = env.LOG_SINK_URL || 'https://http-intake.logs.datadoghq.com/api/v2/logs';
  const ddEvents = events.map((e) => ({
    ddsource: 'cloudflare-workers',
    ddtags: env.LOG_SINK_DATASET || 'env:production',
    ...e,
  }));

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'DD-API-KEY': env.LOG_SINK_TOKEN || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ddEvents),
  });

  if (!res.ok) {
    console.error(JSON.stringify({
      event: 'log_drain_error',
      sink: 'datadog',
      status: res.status,
      ts: new Date().toISOString(),
    }));
  }
}

async function sendToLogtail({ events, env }: SinkPayload): Promise<void> {
  const url = env.LOG_SINK_URL || 'https://in.logtail.com';

  for (const event of events) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.LOG_SINK_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!res.ok) {
      console.error(JSON.stringify({
        event: 'log_drain_error',
        sink: 'logtail',
        status: res.status,
        ts: new Date().toISOString(),
      }));
      break; // stop on first failure
    }
  }
}

// ── Normalisation ─────────────────────────────────────────────────────────────

function normaliseTailEvent(
  tailEvent: TailEvent,
  environment: string,
): NormalisedEvent[] {
  const service = tailEvent.scriptName || 'unknown-worker';
  const outcome = tailEvent.outcome;
  const baseTime = new Date(tailEvent.eventTimestamp).toISOString();

  const events: NormalisedEvent[] = [];

  // Log lines emitted by the worker
  for (const log of tailEvent.logs) {
    const messageArr = log.message;
    let message = '';
    let parsed: Record<string, unknown> | null = null;

    if (messageArr.length === 1 && typeof messageArr[0] === 'string') {
      // Try to parse as structured JSON log from @webwaka/logging
      try {
        parsed = JSON.parse(messageArr[0] as string);
        message = (parsed?.msg as string) || messageArr[0] as string;
      } catch {
        message = messageArr[0] as string;
      }
    } else {
      message = messageArr.map((m) => (typeof m === 'string' ? m : JSON.stringify(m))).join(' ');
    }

    const resolvedRequestId = parsed?.ctx
      ? (parsed.ctx as Record<string, string>).request_id
      : undefined;
    const event: NormalisedEvent = {
      timestamp: new Date(log.timestamp).toISOString(),
      service,
      environment,
      outcome,
      level: log.level || 'info',
      message,
      ...(resolvedRequestId !== undefined ? { request_id: resolvedRequestId } : {}),
    };

    if (parsed) {
      event.raw = parsed;
    }

    events.push(event);
  }

  // Exceptions from the worker
  for (const exc of tailEvent.exceptions) {
    const reqMethod = tailEvent.event?.request?.method;
    const reqUrl = sanitizeUrl(tailEvent.event?.request?.url);
    events.push({
      timestamp: new Date(exc.timestamp).toISOString(),
      service,
      environment,
      outcome,
      level: 'error',
      message: `Exception: ${exc.name}: ${exc.message}`,
      error: `${exc.name}: ${exc.message}`,
      ...(reqMethod !== undefined ? { request_method: reqMethod } : {}),
      ...(reqUrl !== undefined ? { request_url: reqUrl } : {}),
    });
  }

  // If no logs/exceptions but there's a non-ok outcome, emit a synthetic event
  if (events.length === 0 && outcome !== 'ok') {
    const reqMethod = tailEvent.event?.request?.method;
    const reqUrl = sanitizeUrl(tailEvent.event?.request?.url);
    events.push({
      timestamp: baseTime,
      service,
      environment,
      outcome,
      level: 'warn',
      message: `Worker finished with outcome: ${outcome}`,
      ...(reqMethod !== undefined ? { request_method: reqMethod } : {}),
      ...(reqUrl !== undefined ? { request_url: reqUrl } : {}),
    });
  }

  return events;
}

/** Strip query params from URLs before logging to avoid capturing tokens/PII */
function sanitizeUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split('?')[0];
  }
}

// ── Tail Worker handler ───────────────────────────────────────────────────────


// ── Tail Worker handler (named export for testability) ────────────────────────
// Export the handler object directly so tests can import without going through
// the `export default {}` CF Workers entry, which triggers Vitest SSR interop
// issues (`__vite_ssr_exportName__ is not defined`).

export const tailHandler = {
  async tail(
    events: TailEvent[],
    env: LogTailEnv,
    _ctx: ExecutionContext,
  ): Promise<void> {
    const environment = env.ENVIRONMENT || 'unknown';
    const sink = (env.LOG_SINK || 'console').toLowerCase();

    const normalisedEvents: NormalisedEvent[] = [];
    for (const event of events) {
      normalisedEvents.push(...normaliseTailEvent(event, environment));
    }

    if (normalisedEvents.length === 0) return;

    const payload: SinkPayload = { events: normalisedEvents, env };

    switch (sink) {
      case 'axiom':
        await sendToAxiom(payload);
        break;
      case 'datadog':
        await sendToDatadog(payload);
        break;
      case 'logtail':
        await sendToLogtail(payload);
        break;
      case 'console':
      default:
        for (const e of normalisedEvents) {
          const line = JSON.stringify(e);
          if (e.level === 'error') console.error(line);
          else if (e.level === 'warn') console.warn(line);
          else console.log(line);
        }
        break;
    }
  },
};

export default tailHandler;
