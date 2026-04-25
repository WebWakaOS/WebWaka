/**
 * Streaming SSE route tests — POST /superagent/chat/stream (SA-3.x)
 *
 * Tests:
 *   1. SSE delta frame format — each chunk wrapped as data:{delta,done:false}
 *   2. Terminal event structure — done:true with session_id, usage, waku_cu_charged
 *   3. Error event — adapter throw emits event:error SSE frame
 *   4. Capability guard — function_call returns 400 STREAMING_NOT_SUPPORTED_FOR_TOOL_CALLS
 *   5. Provider guard — adapter without stream() returns 501
 *   6. Spend write called — D1 INSERT attempted on ai_spend_events after stream
 *   7. Missing messages returns 400
 *   8. SSE headers — Content-Type: text/event-stream, Cache-Control: no-cache, X-Accel-Buffering: no
 */

import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';

// ── Module mocks ─────────────────────────────────────────────────────────────

const mockStream = vi.fn();
const mockComplete = vi.fn();

vi.mock('@webwaka/ai-adapters', () => ({
  createAdapter: vi.fn(() => ({
    complete: mockComplete,
    stream: mockStream,
  })),
}));

vi.mock('@webwaka/ai', async (importOriginal) => {
  const original = await importOriginal<typeof import('@webwaka/ai')>();
  return {
    ...original,
    resolveAdapter: vi.fn().mockResolvedValue({
      config: { provider: 'openrouter', model: 'test-model', apiKey: 'sk-test' },
      level: 3,
      wakaCuPer1kTokens: 10,
    }),
  };
});

import { superagentRoutes } from './superagent.js';

// ── DB mock factory ──────────────────────────────────────────────────────────

interface MockQueryResult {
  first: unknown;
  all: unknown[];
  run: { success: boolean; meta?: { changes?: number } };
}

/** Consent row returned for superagent_consents SELECT (required by aiConsentGate) */
const MOCK_CONSENT_ROW = { id: 'consent_abc', granted: 1 as const, granted_at: 1745000000 };

function makeMockDB(
  queryResults: Record<string, MockQueryResult> = {},
  spyMap: { spendInsertRunSpy?: ReturnType<typeof vi.fn> } = {},
) {
  const defaultResult: MockQueryResult = {
    first: null,
    all: [],
    run: { success: true },
  };

  const spendRun = spyMap.spendInsertRunSpy ?? vi.fn().mockResolvedValue({ success: true });

  return {
    prepare: vi.fn().mockImplementation((sql: string) => {
      const isSpendInsert =
        sql.includes('ai_spend_events') && sql.trim().toUpperCase().startsWith('INSERT');

      // aiConsentGate: getAiConsentStatus queries superagent_consents to confirm NDPR consent
      const isConsentSelect =
        sql.includes('superagent_consents') && !sql.trim().toUpperCase().startsWith('INSERT');

      const matchEntry = Object.entries(queryResults).find(([key]) => sql.includes(key));
      const r = matchEntry ? matchEntry[1] : defaultResult;

      const boundFn = {
        first: <T>() =>
          isConsentSelect
            ? Promise.resolve(MOCK_CONSENT_ROW as unknown as T)
            : Promise.resolve(r.first as T),
        run: () => (isSpendInsert ? spendRun() : Promise.resolve(r.run)),
        all: <T>() => Promise.resolve({ results: r.all as T[] }),
      };

      return {
        bind: (..._args: unknown[]) => boundFn,
        ...boundFn,
      };
    }),
    batch: vi.fn().mockResolvedValue([{ success: true }, { success: true }]),
  };
}

// ── Test app factory ─────────────────────────────────────────────────────────

/**
 * Builds a minimal Hono test app that:
 *  1. Injects a synthetic auth context (bypassing real JWT verification)
 *  2. Injects aiConsentId so aiConsentGate's post-gate DB writes work
 *  3. Mounts superagentRoutes under /superagent
 *
 * The `aiConsentGate` route middleware is invoked, but `c.get('auth')` returns
 * our injected auth so all consent gate checks (USSD, aiRights, NDPR) pass.
 */
function makeStreamApp(opts: {
  db?: ReturnType<typeof makeMockDB>;
  userId?: string;
  tenantId?: string;
  role?: string;
} = {}) {
  const app = new Hono();

  app.use('*', async (c, next) => {
    c.set('auth', {
      userId: opts.userId ?? 'usr_001',
      tenantId: opts.tenantId ?? 'tnt_001',
      workspaceId: 'ws_001',
      role: opts.role ?? 'admin',
      aiRights: true,             // aiConsentGate reads this from auth
    } as never);

    // Pre-set aiConsentId so aiConsentGate's NDPR attach step is satisfied
    (c.set as (k: string, v: unknown) => void)('aiConsentId', 'consent_abc');

    c.env = {
      DB: opts.db ?? makeMockDB(),
      AI_ROUTER_KV: {},
      JWT_SECRET: 'test-secret-minimum-32-characters!',
      ENVIRONMENT: 'test',
    } as never;

    await next();
  });

  app.route('/superagent', superagentRoutes);
  return app;
}

function streamPost(body: unknown): Request {
  return new Request('http://localhost/superagent/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Intent': 'm2m',
    },
    body: JSON.stringify(body),
  });
}

/** Read a ReadableStream body to a string */
async function readBodyText(response: Response): Promise<string> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let result = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }
  result += decoder.decode();
  return result;
}

/** Parse SSE text into an array of event objects */
function parseSseEvents(raw: string): Array<{ event?: string; data: string }> {
  const events: Array<{ event?: string; data: string }> = [];
  const blocks = raw.split('\n\n').filter(Boolean);
  for (const block of blocks) {
    const lines = block.split('\n');
    let eventType: string | undefined;
    let dataLine = '';
    for (const line of lines) {
      if (line.startsWith('event: ')) eventType = line.slice(7).trim();
      if (line.startsWith('data: ')) dataLine = line.slice(6).trim();
    }
    if (dataLine) events.push({ event: eventType, data: dataLine });
  }
  return events;
}

// ── Test suite ───────────────────────────────────────────────────────────────

describe('POST /superagent/chat/stream', () => {
  it('returns 400 when capability is function_call', async () => {
    const app = makeStreamApp();
    const res = await app.fetch(
      streamPost({ capability: 'function_call', messages: [{ role: 'user', content: 'hello' }] }),
    );
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('STREAMING_NOT_SUPPORTED_FOR_TOOL_CALLS');
  });

  it('returns 400 when messages array is missing', async () => {
    const app = makeStreamApp();
    const res = await app.fetch(streamPost({ capability: 'superagent_chat' }));
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('messages array is required and must not be empty');
  });

  it('returns 501 when adapter does not implement stream()', async () => {
    const { createAdapter } = await import('@webwaka/ai-adapters');
    vi.mocked(createAdapter).mockReturnValueOnce({
      complete: mockComplete,
      // stream intentionally omitted
    });

    const app = makeStreamApp();
    const res = await app.fetch(
      streamPost({ capability: 'superagent_chat', messages: [{ role: 'user', content: 'hi' }] }),
    );
    expect(res.status).toBe(501);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('STREAMING_NOT_SUPPORTED_BY_PROVIDER');
  });

  it('streams three delta chunks then a terminal done event with correct SSE headers', async () => {
    const chunks = ['Hello', ', world', '!'];

    mockStream.mockReturnValueOnce(
      (async function* () {
        for (const chunk of chunks) {
          yield chunk;
        }
      })(),
    );

    const app = makeStreamApp();
    const res = await app.fetch(
      streamPost({
        capability: 'superagent_chat',
        messages: [{ role: 'user', content: 'Say hello.' }],
      }),
    );

    // HTTP 200 with SSE headers
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/event-stream');
    expect(res.headers.get('Cache-Control')).toBe('no-cache');
    expect(res.headers.get('X-Accel-Buffering')).toBe('no');

    const rawText = await readBodyText(res);
    const events = parseSseEvents(rawText);

    // Three delta events + one terminal done event
    expect(events.length).toBeGreaterThanOrEqual(4);

    // Verify first three are delta frames: no event: line, done:false
    for (let i = 0; i < 3; i++) {
      expect(events[i]!.event).toBeUndefined();
      const payload = JSON.parse(events[i]!.data) as { delta: string; done: boolean };
      expect(payload.done).toBe(false);
      expect(payload.delta).toBe(chunks[i]);
    }

    // Verify terminal event
    const termEvent = events[events.length - 1]!;
    expect(termEvent.event).toBeUndefined();
    const termPayload = JSON.parse(termEvent.data) as {
      done: boolean;
      session_id: string;
      waku_cu_charged: number;
      usage: { input_tokens: number; output_tokens: number };
    };
    expect(termPayload.done).toBe(true);
    expect(typeof termPayload.session_id).toBe('string');
    expect(termPayload.session_id.length).toBeGreaterThan(0);
    expect(typeof termPayload.waku_cu_charged).toBe('number');
    expect(termPayload.usage).toBeDefined();
    expect(typeof termPayload.usage.input_tokens).toBe('number');
    expect(typeof termPayload.usage.output_tokens).toBe('number');
  });

  it('sends an SSE error event when the adapter stream throws mid-stream', async () => {
    mockStream.mockReturnValueOnce(
      (async function* () {
        yield 'partial chunk';
        throw new Error('Provider connection lost');
      })(),
    );

    const app = makeStreamApp();
    const res = await app.fetch(
      streamPost({
        capability: 'superagent_chat',
        messages: [{ role: 'user', content: 'stream error test' }],
      }),
    );

    // HTTP 200 even for streaming errors — SSE carries the error payload
    expect(res.status).toBe(200);

    const rawText = await readBodyText(res);
    const events = parseSseEvents(rawText);

    // At minimum: partial delta chunk + error event
    expect(events.length).toBeGreaterThanOrEqual(2);

    // First: partial delta
    const firstPayload = JSON.parse(events[0]!.data) as { delta: string; done: boolean };
    expect(firstPayload.delta).toBe('partial chunk');
    expect(firstPayload.done).toBe(false);

    // Last: error event frame
    const errEvent = events[events.length - 1]!;
    expect(errEvent.event).toBe('error');
    const errPayload = JSON.parse(errEvent.data) as { code: string; message: string };
    expect(errPayload.code).toBe('AI_STREAM_ERROR');
    expect(errPayload.message).toContain('Provider connection lost');
  });

  it('attempts ai_spend_events INSERT after stream completes', async () => {
    const spendInsertRunSpy = vi.fn().mockResolvedValue({ success: true });
    const chunks = ['spend', ' test'];

    mockStream.mockReturnValueOnce(
      (async function* () {
        for (const chunk of chunks) {
          yield chunk;
        }
      })(),
    );

    const db = makeMockDB({}, { spendInsertRunSpy });
    const app = makeStreamApp({ db });

    const res = await app.fetch(
      streamPost({
        capability: 'superagent_chat',
        messages: [{ role: 'user', content: 'Spend test.' }],
      }),
    );

    // Consume entire stream so fire-and-forget post-stream accounting executes
    await readBodyText(res);

    // Allow microtasks for the fire-and-forget spend write to settle
    await new Promise<void>((resolve) => setTimeout(resolve, 50));

    expect(spendInsertRunSpy).toHaveBeenCalledTimes(1);
  });
});
