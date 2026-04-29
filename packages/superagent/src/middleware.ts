/**
 * SuperAgent Consent Middleware — SA-2.2
 * WebWaka OS — Hono middleware for AI-gated routes.
 *
 * Usage:
 *   app.use('/superagent/*', aiConsentGate);
 *   // OR per-route:
 *   superagentRoutes.post('/chat', aiConsentGate, async (c) => { ... })
 *
 * Guards enforced (in order):
 *   1. P12 — No AI on USSD sessions (assertNotUssd)
 *   2. AI rights check — plan must include AI features
 *   3. P10 — NDPR AI consent required (getAiConsentStatus + assertNdprConsent)
 *
 * On consent missing → 403 JSON body with consent_url.
 * On USSD → 403 JSON body explaining channel limitation.
 * On no AI rights → 403 JSON body with upgrade_url.
 *
 * BUG-023 / COMP-004: After consent is confirmed, persist the consent version
 * into consent_history and update users.consent_version / users.consented_at
 * for NDPR audit trail.
 */

import { assertNdprConsent, assertNotUssd, AIAuthError } from '@webwaka/auth';
import { getAiConsentStatus } from './consent-service.js';

// BUG-023 / COMP-004: Versioned consent document identifier.
// Bump when the AI consent text changes to force re-acceptance.
const AI_CONSENT_VERSION = '1.0';

// Minimal env shape needed by the middleware
interface AiGateEnv {
  DB: D1Database;
}

// Minimal auth shape read from the Hono context store
interface AuthShape {
  userId: string;
  tenantId: string;
  aiRights?: boolean;
}

// Hono middleware function type (avoids importing full Context generic chain)
type HonoMiddlewareArgs = [
  c: {
    get(key: string): unknown;
    set(key: string, value: unknown): void;
    req: { header(name: string): string | undefined };
    env: AiGateEnv;
    executionCtx?: { waitUntil?: (promise: Promise<unknown>) => void };
    json(data: unknown, status?: number): Response;
  },
  next: () => Promise<void>,
];

/**
 * BUG-023 / COMP-004: Persist consent version to consent_history + users table.
 * Called after consent is confirmed. Fire-and-forget — never blocks the request.
 *
 * Writes to consent_history only if no row exists for (user_id, consent_version).
 * Also keeps users.consent_version and users.consented_at in sync.
 */
async function persistConsentVersion(
  db: D1Database,
  userId: string,
  tenantId: string,
  consentTextHash: string,
): Promise<void> {
  const existing = await (db as unknown as {
    prepare(sql: string): { bind(...v: unknown[]): { first<T>(): Promise<T | null> } };
  })
    .prepare(
      `SELECT id FROM consent_history
       WHERE user_id = ? AND tenant_id = ? AND consent_version = ?
       LIMIT 1`,
    )
    .bind(userId, tenantId, AI_CONSENT_VERSION)
    .first<{ id: string }>();

  if (existing) return; // Already recorded for this consent version — skip.

  const id = crypto.randomUUID();
  const db2 = db as unknown as {
    prepare(sql: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }> } };
    batch(stmts: unknown[]): Promise<unknown[]>;
  };

  await db2
    .prepare(
      `INSERT INTO consent_history (id, user_id, tenant_id, consent_version, consent_text_hash, consented_at)
       VALUES (?, ?, ?, ?, ?, unixepoch())`,
    )
    .bind(id, userId, tenantId, AI_CONSENT_VERSION, consentTextHash)
    .run();

  await db2
    .prepare(
      `UPDATE users
       SET consent_version = ?, consented_at = unixepoch()
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(AI_CONSENT_VERSION, userId, tenantId)
    .run();
}

/**
 * Hono middleware that gates any AI-powered route.
 *
 * Expects `auth` to be set in the context store by the auth middleware.
 * Attaches `aiConsentId` to the context on success so downstream routes
 * can reference the consent record in ai_usage_events.
 */
export async function aiConsentGate(
  ...[c, next]: HonoMiddlewareArgs
): Promise<Response | void> {
  try {
    const auth = c.get('auth') as AuthShape | undefined;

    if (!auth) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    // P12 — USSD guard (header set by USSD Gateway Worker, verified via INTER_SERVICE_SECRET)
    const channel = c.req.header('x-waka-channel');
    assertNotUssd(channel);

    // Plan AI rights check (from JWT claim — no DB hit needed)
    if (auth.aiRights === false) {
      return c.json(
        {
          error: 'AI_RIGHTS_DENIED',
          message:
            'Your current plan does not include AI features. ' +
            'Upgrade to Growth or Enterprise to unlock SuperAgent.',
          upgrade_url: '/workspaces/upgrade',
        },
        403,
      );
    }

    // P10 — NDPR AI consent check (D1 lookup against superagent_consents)
    const status = await getAiConsentStatus(
      c.env.DB as unknown as Parameters<typeof getAiConsentStatus>[0],
      auth.userId,
      auth.tenantId,
    );
    assertNdprConsent(status.granted);

    // Attach consent ID so the usage-meter can reference it (P10 audit)
    c.set('aiConsentId', status.consentId);

    // BUG-023 / COMP-004: Persist consent version — fire-and-forget, never blocks.
    // Fetch the consent_text_hash from the active consent record for audit trail.
    const persistPromise = (async () => {
      try {
        const consentRow = await (c.env.DB as unknown as {
          prepare(sql: string): {
            bind(...v: unknown[]): { first<T>(): Promise<T | null> };
          };
        })
          .prepare(
            `SELECT consent_text_hash FROM superagent_consents
             WHERE id = ? LIMIT 1`,
          )
          .bind(status.consentId)
          .first<{ consent_text_hash: string }>();

        const textHash = consentRow?.consent_text_hash ?? 'unknown';
        await persistConsentVersion(c.env.DB, auth.userId, auth.tenantId, textHash);
      } catch {
        // Non-blocking — consent gate must not fail because of consent_history write
      }
    })();

    if (c.executionCtx?.waitUntil) {
      c.executionCtx.waitUntil(persistPromise);
    } else {
      void persistPromise;
    }

    await next();
  } catch (err) {
    if (err instanceof AIAuthError) {
      return c.json(
        {
          error: err.code,
          message: err.message,
          ...(err.code === 'NDPR_CONSENT_REQUIRED'
            ? { consent_url: '/superagent/consent' }
            : {}),
        },
        403,
      );
    }
    throw err;
  }
}
