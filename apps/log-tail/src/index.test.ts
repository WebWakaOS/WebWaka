/**
 * Tests for log-tail worker (L-1)
 *
 * Verifies normalisation logic and sink routing without live HTTP calls.
 * fetch is mocked globally.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── minimal re-export of internals for testing ────────────────────────────────
// We test via the exported default handler + mock fetch

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Import after stubbing
const { default: handler } = await import('./index.js');

// ── helpers ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeTailEvent(overrides: Record<string, unknown> = {}): any {
  return {
    scriptName: 'api-worker',
    outcome: 'ok',
    exceptions: [],
    logs: [
      {
        message: [JSON.stringify({ level: 'info', msg: 'request handled', ctx: { request_id: 'req-abc' } })],
        level: 'log',
        timestamp: Date.now(),
      },
    ],
    eventTimestamp: Date.now(),
    event: {
      request: { method: 'GET', url: 'https://api.webwaka.com/v1/health?token=secret', headers: {} },
      type: 'fetch',
    },
    ...overrides,
  };
}

const mockCtx = { waitUntil: vi.fn() } as unknown as ExecutionContext;

// ── tests ─────────────────────────────────────────────────────────────────────

describe('log-tail worker — console sink', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetch.mockReset();
  });

  it('outputs structured JSON to console when sink=console', async () => {
    const logSpy = vi.spyOn(console, 'log');
    await handler.tail([makeTailEvent()], { LOG_SINK: 'console', ENVIRONMENT: 'test' }, mockCtx);
    expect(logSpy).toHaveBeenCalledOnce();
    const output = JSON.parse((logSpy.mock.calls[0]![0] as string));
    expect(output.service).toBe('api-worker');
    expect(output.environment).toBe('test');
    expect(output.message).toBe('request handled');
    expect(output.request_id).toBe('req-abc');
  });

  it('sanitizes URL — strips query params', async () => {
    const logSpy = vi.spyOn(console, 'log');
    const event = makeTailEvent({ outcome: 'exception', exceptions: [{ name: 'Error', message: 'fail', timestamp: Date.now() }], logs: [] });
    await handler.tail([event], { LOG_SINK: 'console', ENVIRONMENT: 'test' }, mockCtx);
    expect(logSpy).not.toHaveBeenCalled(); // errors go to console.error
    const errSpy = vi.spyOn(console, 'error');
    await handler.tail([event], { LOG_SINK: 'console', ENVIRONMENT: 'test' }, mockCtx);
    const output = JSON.parse((errSpy.mock.calls[0]![0] as string));
    expect(output.request_url).not.toContain('token=secret');
    expect(output.request_url).toBe('https://api.webwaka.com/v1/health');
  });

  it('does not fetch when sink=console', async () => {
    await handler.tail([makeTailEvent()], { LOG_SINK: 'console' }, mockCtx);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('handles empty events array gracefully', async () => {
    const logSpy = vi.spyOn(console, 'log');
    await handler.tail([], { LOG_SINK: 'console' }, mockCtx);
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('emits synthetic warn event for non-ok outcome with no logs', async () => {
    const warnSpy = vi.spyOn(console, 'warn');
    const event = makeTailEvent({ outcome: 'exceededCpu', logs: [], exceptions: [] });
    await handler.tail([event], { LOG_SINK: 'console', ENVIRONMENT: 'staging' }, mockCtx);
    expect(warnSpy).toHaveBeenCalledOnce();
    const output = JSON.parse((warnSpy.mock.calls[0]![0] as string));
    expect(output.outcome).toBe('exceededCpu');
    expect(output.level).toBe('warn');
  });
});

describe('log-tail worker — axiom sink', () => {
  beforeEach(() => { mockFetch.mockReset(); });

  it('POSTs to Axiom ingest endpoint with Bearer token', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });
    await handler.tail(
      [makeTailEvent()],
      { LOG_SINK: 'axiom', LOG_SINK_TOKEN: 'axiom-token-123', LOG_SINK_DATASET: 'webwaka-logs', ENVIRONMENT: 'production' },
      mockCtx,
    );
    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('axiom.co');
    expect(url).toContain('webwaka-logs');
    expect((opts.headers as Record<string, string>)['Authorization']).toBe('Bearer axiom-token-123');
    const body = JSON.parse(opts.body as string);
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].service).toBe('api-worker');
  });

  it('logs error but does not throw on Axiom 4xx', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    await expect(
      handler.tail([makeTailEvent()], { LOG_SINK: 'axiom', LOG_SINK_TOKEN: 'bad' }, mockCtx),
    ).resolves.toBeUndefined();
    expect(errSpy).toHaveBeenCalledOnce();
    const logged = JSON.parse((errSpy.mock.calls[0]![0] as string));
    expect(logged.event).toBe('log_drain_error');
    expect(logged.sink).toBe('axiom');
  });
});

describe('log-tail worker — datadog sink', () => {
  beforeEach(() => { mockFetch.mockReset(); });

  it('POSTs to Datadog intake with DD-API-KEY header', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 202 });
    await handler.tail(
      [makeTailEvent()],
      { LOG_SINK: 'datadog', LOG_SINK_TOKEN: 'dd-key-456', LOG_SINK_DATASET: 'env:staging', ENVIRONMENT: 'staging' },
      mockCtx,
    );
    const [url, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('datadoghq.com');
    expect((opts.headers as Record<string, string>)['DD-API-KEY']).toBe('dd-key-456');
  });
});

describe('log-tail worker — logtail sink', () => {
  beforeEach(() => { mockFetch.mockReset(); });

  it('POSTs each event individually to Logtail', async () => {
    const event = makeTailEvent();
    // Two log lines
    event.logs.push({ message: ['second log'], level: 'log', timestamp: Date.now() });
    mockFetch.mockResolvedValue({ ok: true, status: 202 });

    await handler.tail(
      [event],
      { LOG_SINK: 'logtail', LOG_SINK_TOKEN: 'lt-token-789', ENVIRONMENT: 'staging' },
      mockCtx,
    );
    expect(mockFetch).toHaveBeenCalledTimes(2);
    const [url, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('logtail.com');
    expect((opts.headers as Record<string, string>)['Authorization']).toBe('Bearer lt-token-789');
  });
});
