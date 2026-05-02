/**
 * Analytics Event Taxonomy — Wave 3 C6-5
 * [@webwaka/analytics]
 *
 * Canonical registry of all analytics events emitted by Wave 3 features.
 * Every event must be listed here with:
 *   - name: snake_case string constant
 *   - source: which app/worker emits it
 *   - properties: typed schema
 *   - pillars: which platform pillars it covers
 *
 * This file is the single source of truth for the event taxonomy.
 * The governance check (check-analytics-taxonomy.ts) validates that
 * all Wave 3 features listed here emit events in their implementation.
 */

export const ANALYTICS_EVENTS = {
  // ── SuperAgent / AI ────────────────────────────────────────────────────────
  SUPERAGENT_CHAT_STARTED: {
    name:     'superagent_chat_started',
    source:   'apps/api/src/routes/superagent',
    pillars:  ['P7'],
    properties: {
      session_id:    'string',
      capability:    'string', // e.g. "inventory_ai", "vertical_advisor"
      tenant_id:     'string',
      model:         'string',
    },
  },

  SUPERAGENT_CHAT_COMPLETED: {
    name:     'superagent_chat_completed',
    source:   'apps/api/src/routes/superagent',
    pillars:  ['P7', 'P9'],
    properties: {
      session_id:    'string',
      tenant_id:     'string',
      tokens_used:   'number',
      waka_cu:       'number',
      duration_ms:   'number',
      model:         'string',
      degraded:      'boolean | undefined',
    },
  },

  SUPERAGENT_CHAT_FAILED: {
    name:     'superagent_chat_failed',
    source:   'apps/api/src/routes/superagent',
    pillars:  ['P7'],
    properties: {
      session_id:    'string',
      tenant_id:     'string',
      error_type:    'string', // "ai_provider_unavailable" | "rate_limited" | "spend_exceeded"
      tokens_used:   'number', // always 0 on failure (P9)
    },
  },

  // ── Vertical Engine ────────────────────────────────────────────────────────
  VERTICAL_PROFILE_VIEWED: {
    name:     'vertical_profile_viewed',
    source:   'apps/workspace-app/src/pages/VerticalView',
    pillars:  ['P2'],
    properties: {
      vertical_slug: 'string',
      workspace_id:  'string',
      tenant_id:     'string',
    },
  },

  VERTICAL_AI_ADVISOR_OPENED: {
    name:     'vertical_ai_advisor_opened',
    source:   'apps/workspace-app/src/pages/VerticalView',
    pillars:  ['P2', 'P7'],
    properties: {
      vertical_slug: 'string',
      tenant_id:     'string',
    },
  },

  // ── Credits / Billing ──────────────────────────────────────────────────────
  WAKA_CU_CHARGED: {
    name:     'waka_cu_charged',
    source:   'apps/api/src/services/credits',
    pillars:  ['P9'],
    properties: {
      tenant_id:     'string',
      amount_wc:     'number',
      reason:        'string', // "ai_completion" | "superagent_tool" | "manual"
      balance_after: 'number',
    },
  },

  SPEND_LIMIT_REACHED: {
    name:     'spend_limit_reached',
    source:   'apps/api/src/services/credits',
    pillars:  ['P9'],
    properties: {
      tenant_id:     'string',
      cap_wc:        'number',
      attempted_wc:  'number',
    },
  },

  // ── Analytics Page ─────────────────────────────────────────────────────────
  ANALYTICS_PAGE_VIEWED: {
    name:     'analytics_page_viewed',
    source:   'apps/workspace-app/src/pages/Analytics',
    pillars:  ['P1'],
    properties: {
      workspace_id:  'string',
      tenant_id:     'string',
      date_range:    'string',
    },
  },

  // ── Admin / HITL ───────────────────────────────────────────────────────────
  HITL_TASK_CREATED: {
    name:     'hitl_task_created',
    source:   'apps/api/src/routes/hitl',
    pillars:  ['P7'],
    properties: {
      task_id:       'string',
      task_type:     'string',
      tenant_id:     'string',
      priority:      'string',
    },
  },

  HITL_TASK_RESOLVED: {
    name:     'hitl_task_resolved',
    source:   'apps/admin-dashboard/src/pages/HITL',
    pillars:  ['P7'],
    properties: {
      task_id:       'string',
      resolution:    'string', // "approved" | "rejected" | "escalated"
      resolver_id:   'string',
      duration_ms:   'number',
    },
  },

  // ── PWA / Offline ──────────────────────────────────────────────────────────
  PWA_OFFLINE_SERVED: {
    name:     'pwa_offline_served',
    source:   'apps/workspace-app/src/sw',
    pillars:  ['P4'],
    properties: {
      route:         'string',
      tenant_id:     'string | undefined',
    },
  },
} as const;

export type EventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]['name'];

/** All valid event names as a Set for runtime validation */
export const VALID_EVENT_NAMES = new Set<string>(
  Object.values(ANALYTICS_EVENTS).map(e => e.name)
);

/** Emit a typed analytics event (browser + Worker compatible) */
export function emitEvent(name: EventName, properties: Record<string, unknown>): void {
  // In production: POST to /internal/analytics/events (fire-and-forget)
  // In development: console.debug
  if (typeof globalThis.fetch === 'undefined') return;
  const payload = { event: name, properties, ts: new Date().toISOString() };
  try {
    void fetch('/internal/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Fire-and-forget — analytics must never block the main request
  }
}
