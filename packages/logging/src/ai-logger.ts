/**
 * AI Event Logger — Wave 3 (A6-4)
 * WebWaka OS — Structured AI event logging helper.
 *
 * Emits a structured JSON log line for every AI event:
 *   logAiEvent(logger, event) → writes one log entry with all routing
 *   metadata but WITHOUT PII (P13) and WITHOUT raw API keys (P8).
 *
 * All fields are optional except: tenantId, capability, event.
 *
 * Platform Invariants:
 *   P8  — API keys must NEVER appear in logs
 *   P13 — PII (name, phone, email, NIN, BVN) must NOT appear in AI logs
 *
 * Log format (JSON):
 * {
 *   "level": "info",
 *   "ts": "2026-05-02T08:00:00.000Z",
 *   "service": "ai",
 *   "event": "ai.request.completed",
 *   "tenantId": "t-xxx",            ← always present
 *   "capability": "inventory_ai",
 *   "routingLevel": 3,
 *   "provider": "groq",
 *   "model": "llama-3.1-8b-instant",
 *   "durationMs": 812,
 *   "tokensIn": 340,
 *   "tokensOut": 110,
 *   "wakaCuCharged": 5,
 *   "toolRounds": 1,
 *   "errorCode": null               ← null on success
 * }
 */

import type { Logger } from './types.js';

// ---------------------------------------------------------------------------
// AI event types
// ---------------------------------------------------------------------------

export type AIEventName =
  | 'ai.request.started'
  | 'ai.request.completed'
  | 'ai.request.failed'
  | 'ai.tool.executed'
  | 'ai.hitl.submitted'
  | 'ai.hitl.approved'
  | 'ai.hitl.rejected'
  | 'ai.hitl.expired'
  | 'ai.budget.exhausted'
  | 'ai.adapter.fallback'        // routing fell to level 5
  | 'ai.adapter.byok_resolved';  // level 1 or 2 resolved

export interface AILogEvent {
  /** Event name */
  event: AIEventName;
  /** Tenant ID (T3 — always required) */
  tenantId: string;
  /** Capability being invoked */
  capability: string;
  /** AI routing level (1–5) */
  routingLevel?: 1 | 2 | 3 | 4 | 5;
  /** AI provider name */
  provider?: string;
  /** Model name */
  model?: string;
  /** Request-to-response duration in milliseconds */
  durationMs?: number;
  /** Input tokens */
  tokensIn?: number;
  /** Output tokens */
  tokensOut?: number;
  /** WakaCU charged for this call */
  wakaCuCharged?: number;
  /** Number of tool rounds executed */
  toolRounds?: number;
  /** Tool name (for ai.tool.executed events) */
  toolName?: string;
  /** Whether the tool call succeeded */
  toolSuccess?: boolean;
  /** Error code if the event is a failure (never include raw error messages with PII) */
  errorCode?: string;
  /** Short, PII-free error description */
  errorSummary?: string;
  /** Request correlation ID */
  requestId?: string;
  /** Vertical slug */
  verticalSlug?: string;
  /** Session ID */
  sessionId?: string;
}

// ---------------------------------------------------------------------------
// PII field guard — prevent accidental PII leakage in AI logs
// ---------------------------------------------------------------------------

/** Field names that must never appear in AI log events. */
const PII_FIELD_NAMES = new Set([
  'name', 'fullName', 'firstName', 'lastName', 'email', 'phone',
  'phoneNumber', 'nin', 'bvn', 'address', 'dateOfBirth', 'dob',
  'passport', 'nationalId', 'taxId',
]);

function assertNoPII(event: AILogEvent): void {
  for (const key of Object.keys(event)) {
    if (PII_FIELD_NAMES.has(key)) {
      throw new Error(
        `[P13 VIOLATION] AI log event contains PII field '${key}'. Strip it before logging.`,
      );
    }
  }
  // Never log API key fragments (P8)
  const raw = JSON.stringify(event);
  if (/sk-[a-zA-Z0-9]{8}/.test(raw) || /gsk-[a-zA-Z0-9]{8}/.test(raw)) {
    throw new Error('[P8 VIOLATION] AI log event appears to contain an API key fragment.');
  }
}

// ---------------------------------------------------------------------------
// Main helper
// ---------------------------------------------------------------------------

/**
 * Log a structured AI event.
 *
 * @example
 * logAiEvent(logger, {
 *   event: 'ai.request.completed',
 *   tenantId: auth.tenantId,
 *   capability: 'inventory_ai',
 *   routingLevel: resolved.level,
 *   provider: resolved.config.provider,
 *   model: resolved.config.model,
 *   durationMs: Date.now() - startedAt,
 *   tokensIn: result.tokensUsed,
 *   wakaCuCharged: burnResult.wakaCuCharged,
 * });
 */
export function logAiEvent(logger: Logger, event: AILogEvent): void {
  // Guard against PII leakage in dev/test (throws hard so CI catches it)
  if (typeof process !== 'undefined' && process.env['NODE_ENV'] !== 'production') {
    assertNoPII(event);
  }

  const level = event.errorCode ? 'warn' : 'info';
  const msg = `[AI] ${event.event}`;

  const ctx: Record<string, string | number | boolean | undefined> = {
    event: event.event,
    tenantId: event.tenantId,
    capability: event.capability,
    ...(event.routingLevel !== undefined  && { routingLevel: event.routingLevel }),
    ...(event.provider                    && { provider: event.provider }),
    ...(event.model                       && { model: event.model }),
    ...(event.durationMs !== undefined    && { durationMs: event.durationMs }),
    ...(event.tokensIn !== undefined      && { tokensIn: event.tokensIn }),
    ...(event.tokensOut !== undefined     && { tokensOut: event.tokensOut }),
    ...(event.wakaCuCharged !== undefined && { wakaCuCharged: event.wakaCuCharged }),
    ...(event.toolRounds !== undefined    && { toolRounds: event.toolRounds }),
    ...(event.toolName                    && { toolName: event.toolName }),
    ...(event.toolSuccess !== undefined   && { toolSuccess: event.toolSuccess }),
    ...(event.errorCode                   && { errorCode: event.errorCode }),
    ...(event.errorSummary                && { errorSummary: event.errorSummary }),
    ...(event.requestId                   && { requestId: event.requestId }),
    ...(event.verticalSlug                && { verticalSlug: event.verticalSlug }),
    ...(event.sessionId                   && { sessionId: event.sessionId }),
  };

  if (level === 'warn') {
    logger.warn(msg, ctx);
  } else {
    logger.info(msg, ctx);
  }
}
