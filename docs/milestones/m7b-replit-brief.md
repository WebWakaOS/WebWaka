# WebWaka OS — M7b Replit Brief

**Prepared by:** Base44 Super Agent (OpenClaw)
**Date:** 2026-04-08, 09:39 WAT
**Phase:** M7b — Offline Sync + USSD Gateway + POS Float Double-Entry Ledger
**Estimated timeline:** 3 days
**Status:** ACTIVE — M7a merged 2026-04-08, QA 25/25, PR #21 SHA d629339

---

## Context

M7a delivered the full regulatory compliance stack:
- 9 D1 migrations (0013–0021) — users, KYC, OTP, consent, contact channels, webhook idempotency
- `@webwaka/identity` — BVN/NIN/CAC/FRSC via Prembly + Paystack
- `@webwaka/otp` — SMS (Termii) + WhatsApp (Meta) + Telegram multi-channel
- `@webwaka/contact` — contact channel normalization + OTP routing
- 9 API routes: `/contact/verify/*`, `/contact/preferences`, `/identity/verify-bvn`, `/identity/verify-nin`
- 116 tests, all compliance rules P10/P12/P13/R5/R6/R7/R8/R9/R10

M7b now builds the **offline-first runtime**, **USSD gateway**, and **POS agent float ledger**.

---

## Repo State You Are Starting From

**Branch:** create `feat/m7b-offline-ussd-pos` from current `main`
**Main HEAD:** `ade8baf2`

**Do NOT push directly to `main`.** Open PR: `feat/m7b-offline-ussd-pos` → `main`.

---

## M7b Non-Negotiable Platform Invariants

| Invariant | Rule |
|---|---|
| P6 — Offline First | Core journeys must work without network. Writes queue offline, sync on reconnect. |
| P9 — Float Integrity | All monetary values stored as integer kobo (NGN×100). No floating point. |
| P11 — Sync FIFO | Offline queue replays in FIFO order. Server-wins on conflict. No silent drops. |
| T1 — Cloudflare-First | All Workers runtime code. No Node.js HTTP servers in production path. |
| T3 — Tenant Isolation | Every query includes `tenant_id`. Every KV key prefixed `tenant:{id}:`. |
| T4 — Monetary Integrity | `balance_kobo`, `amount_kobo` — always integers. Never floats. |

---

## Deliverable 1 — D1 Migrations (0022–0025)

### Migration 0022 — `agents` table
```sql
-- infra/db/migrations/0022_agents.sql
CREATE TABLE IF NOT EXISTS agents (
  id              TEXT NOT NULL PRIMARY KEY,
  individual_id   TEXT NOT NULL REFERENCES individuals(id),
  workspace_id    TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'suspended', 'decommissioned')),
  kyc_tier        INTEGER NOT NULL DEFAULT 0,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_agents_workspace ON agents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_agents_tenant ON agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agents_individual ON agents(individual_id);
```

### Migration 0023 — `pos_terminals` table
```sql
-- infra/db/migrations/0023_pos_terminals.sql
CREATE TABLE IF NOT EXISTS pos_terminals (
  id              TEXT NOT NULL PRIMARY KEY,
  terminal_ref    TEXT NOT NULL UNIQUE,    -- Hardware terminal ID
  agent_id        TEXT NOT NULL REFERENCES agents(id),
  workspace_id    TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'suspended', 'decommissioned')),
  model           TEXT,                    -- e.g. 'Verifone VX520'
  last_seen_at    INTEGER,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_pos_agent ON pos_terminals(agent_id, status);
CREATE INDEX IF NOT EXISTS idx_pos_workspace ON pos_terminals(workspace_id);
CREATE INDEX IF NOT EXISTS idx_pos_tenant ON pos_terminals(tenant_id);
```

### Migration 0024 — `agent_wallets` + `float_ledger` tables
```sql
-- infra/db/migrations/0024_float_ledger.sql
-- Platform Invariant P9: ALL monetary values are integer kobo. NEVER floating point.

CREATE TABLE IF NOT EXISTS agent_wallets (
  id                TEXT NOT NULL PRIMARY KEY,
  agent_id          TEXT NOT NULL UNIQUE REFERENCES agents(id),
  balance_kobo      INTEGER NOT NULL DEFAULT 0
                    CHECK (balance_kobo >= 0),              -- Cannot go negative
  credit_limit_kobo INTEGER NOT NULL DEFAULT 0
                    CHECK (credit_limit_kobo >= 0),
  tenant_id         TEXT NOT NULL,
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_wallets_agent ON agent_wallets(agent_id);
CREATE INDEX IF NOT EXISTS idx_wallets_tenant ON agent_wallets(tenant_id);

CREATE TABLE IF NOT EXISTS float_ledger (
  id               TEXT NOT NULL PRIMARY KEY,
  wallet_id        TEXT NOT NULL REFERENCES agent_wallets(id),
  amount_kobo      INTEGER NOT NULL,            -- Positive = credit, Negative = debit
  running_balance_kobo INTEGER NOT NULL,        -- Snapshot after this entry
  transaction_type TEXT NOT NULL
                   CHECK (transaction_type IN (
                     'top_up', 'cash_in', 'cash_out', 'commission', 'reversal', 'fee'
                   )),
  reference        TEXT NOT NULL UNIQUE,         -- Idempotency key
  description      TEXT,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_ledger_wallet ON float_ledger(wallet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_reference ON float_ledger(reference);
```

**IMPORTANT:** The `float_ledger` is append-only. No UPDATE or DELETE on ledger rows. Reversals are new rows with negative `amount_kobo`.

### Migration 0025 — `agent_sessions` + `sync_queue_log` tables
```sql
-- infra/db/migrations/0025_agent_sessions_sync.sql

CREATE TABLE IF NOT EXISTS agent_sessions (
  id                TEXT NOT NULL PRIMARY KEY,
  agent_id          TEXT NOT NULL REFERENCES agents(id),
  terminal_id       TEXT REFERENCES pos_terminals(id),    -- NULL for mobile agents
  started_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  ended_at          INTEGER,
  transaction_count INTEGER NOT NULL DEFAULT 0,
  total_kobo        INTEGER NOT NULL DEFAULT 0,
  sync_status       TEXT NOT NULL DEFAULT 'online'
                    CHECK (sync_status IN ('online', 'offline_queued', 'synced')),
  tenant_id         TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_agent ON agent_sessions(agent_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_tenant ON agent_sessions(tenant_id);

-- Server-side sync log — mirrors Dexie.js client queue for audit
CREATE TABLE IF NOT EXISTS sync_queue_log (
  id               TEXT NOT NULL PRIMARY KEY,
  client_id        TEXT NOT NULL,             -- Client-generated UUID
  agent_id         TEXT,
  entity_type      TEXT NOT NULL,
  operation        TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
  payload          TEXT NOT NULL,             -- JSON
  status           TEXT NOT NULL DEFAULT 'received'
                   CHECK (status IN ('received', 'applied', 'rejected', 'conflict')),
  conflict_reason  TEXT,
  applied_at       INTEGER,
  tenant_id        TEXT NOT NULL,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_sync_agent ON sync_queue_log(agent_id, status);
CREATE INDEX IF NOT EXISTS idx_sync_tenant ON sync_queue_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sync_client_id ON sync_queue_log(client_id);
```

---

## Deliverable 2 — `packages/offline-sync` — Full Dexie.js Runtime

**Current state:** Type contracts only (M3 scaffold). Now implement the runtime.

### `src/db.ts` — Dexie.js schema

```typescript
import Dexie, { type Table } from 'dexie';

export interface OfflineQueueItem {
  id?: number;                        // Auto-increment (Dexie internal)
  clientId: string;                   // UUID — sent to server for idempotency
  type: 'create' | 'update' | 'delete' | 'agent_transaction';
  entity: string;                     // 'profiles' | 'agent_transactions' | etc.
  payload: Record<string, unknown>;
  priority: 'critical' | 'high' | 'normal' | 'low';
  status: 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';
  retryCount: number;
  nextRetryAt: number;                // Ms since epoch
  createdAt: number;
  syncedAt?: number;
  error?: string;
}

export class WebWakaOfflineDB extends Dexie {
  syncQueue!: Table<OfflineQueueItem>;
  
  constructor() {
    super('webwaka_offline_v1');
    this.version(1).stores({
      syncQueue: '++id, clientId, status, priority, nextRetryAt, entity, createdAt'
    });
  }
}

export const db = new WebWakaOfflineDB();
```

### `src/adapter.ts` — SyncAdapter runtime implementation

```typescript
import { db, type OfflineQueueItem } from './db.js';
import type { SyncAdapter, SyncQueueItem, ConflictResolution } from './types.js';
import { generateId } from './utils.js';

export class WebWakaSyncAdapter implements SyncAdapter {
  
  async enqueue(item: Omit<SyncQueueItem, 'id' | 'attemptCount' | 'status' | 'createdAt' | 'lastAttemptAt' | 'error'>): Promise<string> {
    const clientId = generateId();
    await db.syncQueue.add({
      clientId,
      type: item.operation as OfflineQueueItem['type'],
      entity: item.entityType,
      payload: item.payload as Record<string, unknown>,
      priority: 'normal',
      status: 'pending',
      retryCount: 0,
      nextRetryAt: Date.now(),
      createdAt: Date.now(),
    });
    return clientId;
  }
  
  async dequeue(status: 'pending' | 'failed'): Promise<SyncQueueItem[]> {
    const items = await db.syncQueue
      .where('status').equals(status)
      .and(item => item.nextRetryAt <= Date.now())
      .sortBy('createdAt');  // FIFO — Platform Invariant P11
    return items.map(mapToSyncQueueItem);
  }
  
  async updateStatus(clientId: string, status: SyncQueueItem['status'], error?: string): Promise<void> {
    const item = await db.syncQueue.where('clientId').equals(clientId).first();
    if (!item?.id) return;
    await db.syncQueue.update(item.id, {
      status,
      error: error ?? undefined,
      syncedAt: status === 'synced' ? Date.now() : undefined,
      retryCount: status === 'failed' ? (item.retryCount + 1) : item.retryCount,
      nextRetryAt: status === 'failed' ? computeNextRetry(item.retryCount) : item.nextRetryAt,
    });
  }
  
  async resolveConflict(clientId: string, resolution: ConflictResolution): Promise<void> {
    const item = await db.syncQueue.where('clientId').equals(clientId).first();
    if (!item?.id) return;
    // Server-wins: mark as synced regardless. Platform Invariant P11.
    await db.syncQueue.update(item.id, {
      status: resolution.strategy === 'server-wins' ? 'synced' : 'conflict',
      error: `conflict:${resolution.strategy}`,
      syncedAt: Date.now(),
    });
  }
}

// Exponential backoff: 30s → 2m → 10m → 30m → 1h (max)
function computeNextRetry(retryCount: number): number {
  const delays = [30_000, 120_000, 600_000, 1_800_000, 3_600_000];
  const delay = delays[Math.min(retryCount, delays.length - 1)] ?? 3_600_000;
  return Date.now() + delay;
}
```

### `src/sync-engine.ts` — background sync coordinator

```typescript
export class SyncEngine {
  constructor(
    private adapter: SyncAdapter,
    private apiBase: string,
    private getAuthToken: () => Promise<string>,
  ) {}
  
  /**
   * Called by Service Worker on `sync` event.
   * Processes all pending items in FIFO order (P11).
   */
  async processPendingQueue(): Promise<SyncResult> {
    const pending = await this.adapter.dequeue('pending');
    const failed = await this.adapter.dequeue('failed');
    const items = [...pending, ...failed].sort((a, b) => 
      (a.createdAt ?? 0) - (b.createdAt ?? 0)  // FIFO
    );
    
    let synced = 0, conflicts = 0, errors = 0;
    
    for (const item of items) {
      await this.adapter.updateStatus(item.entityId, 'syncing');
      try {
        const response = await this.postToServer(item);
        if (response.conflict) {
          await this.adapter.resolveConflict(item.entityId, { 
            strategy: 'server-wins', 
            resolvedAt: Date.now() 
          });
          conflicts++;
        } else {
          await this.adapter.updateStatus(item.entityId, 'synced');
          synced++;
        }
      } catch (err) {
        await this.adapter.updateStatus(item.entityId, 'failed', String(err));
        errors++;
      }
    }
    
    return { synced, conflicts, errors, total: items.length };
  }
  
  private async postToServer(item: SyncQueueItem): Promise<{ conflict: boolean }> {
    const token = await this.getAuthToken();
    const res = await fetch(`${this.apiBase}/sync/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        clientId: item.entityId,
        entity: item.entityType,
        operation: item.operation,
        payload: item.payload,
      }),
    });
    if (res.status === 409) return { conflict: true };
    if (!res.ok) throw new Error(`Sync failed: ${res.status}`);
    return { conflict: false };
  }
}

export interface SyncResult {
  synced: number;
  conflicts: number;
  errors: number;
  total: number;
}
```

### `src/service-worker.ts` — Service Worker registration + sync event

```typescript
// Register background sync
export function registerSyncServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(async (registration) => {
      if ('sync' in registration) {
        await (registration as any).sync.register('webwaka-sync');
      }
    });
  }
}

// In sw.js (public/sw.js — not a TS module):
// self.addEventListener('sync', (event) => {
//   if (event.tag === 'webwaka-sync') {
//     event.waitUntil(syncEngine.processPendingQueue());
//   }
// });
```

### `src/offline-indicator.ts` — ENH-37 visibility

```typescript
export type NetworkState = 'online' | 'offline';

export function observeNetworkState(
  onStateChange: (state: NetworkState) => void
): () => void {
  const handleOnline = () => onStateChange('online');
  const handleOffline = () => onStateChange('offline');
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Initial state
  onStateChange(navigator.onLine ? 'online' : 'offline');
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
```

### `src/index.ts` — re-exports
```typescript
export * from './types.js';
export * from './db.js';
export * from './adapter.js';
export * from './sync-engine.js';
export * from './offline-indicator.js';
```

### `package.json` additions:
```json
{
  "dependencies": {
    "dexie": "^3.2.7",
    "@webwaka/types": "workspace:*"
  }
}
```

### Tests required:
- `src/adapter.test.ts` — enqueue, dequeue FIFO order, retry backoff, conflict resolution
- `src/sync-engine.test.ts` — mock fetch, P11 FIFO validation, server-wins conflict
- `src/offline-indicator.test.ts` — online/offline state transitions

---

## Deliverable 3 — `apps/ussd-gateway` — Africa's Talking USSD Worker

### What to implement:

**`wrangler.toml`:**
```toml
name = "webwaka-ussd"
main = "src/index.ts"
compatibility_date = "2024-06-20"
compatibility_flags = ["nodejs_compat"]

[[kv_namespaces]]
binding = "USSD_SESSIONS"
id = "placeholder-replace-in-ci"

[[d1_databases]]
binding = "DB"
database_name = "webwaka-os-staging"
database_id = "placeholder-replace-in-ci"
migrations_dir = "../../infra/db/migrations"
```

**`src/index.ts`** — Hono Worker, handles Africa's Talking webhook:
```typescript
import { Hono } from 'hono';
const app = new Hono<{ Bindings: CloudflareBindings }>();

app.post('/ussd', async (c) => {
  const body = await c.req.parseBody();
  const { sessionId, serviceCode, phoneNumber, text } = body;
  
  const session = await getOrCreateSession(c.env.USSD_SESSIONS, sessionId, phoneNumber);
  const response = await processUSSDInput(session, text as string, c.env);
  
  return c.text(response.text, 200, {
    'Content-Type': 'text/plain',
  });
});

app.get('/health', (c) => c.json({ status: 'ok', service: 'ussd-gateway' }));
export default app;
```

**`src/session.ts`** — KV-backed session state (3-min TTL):
```typescript
export interface USSDSession {
  sessionId: string;
  phone: string;
  state: USSDState;
  data: Record<string, string>;
  createdAt: number;
}

export type USSDState = 
  | 'main_menu'
  | 'wallet_menu'
  | 'send_money_enter_recipient'
  | 'send_money_enter_amount'
  | 'send_money_confirm'
  | 'trending_feed'
  | 'transport_menu'
  | 'community_menu';

const SESSION_TTL = 180; // 3 minutes — per TDR-0010 M7 extension

export async function getOrCreateSession(
  kv: KVNamespace,
  sessionId: string,
  phone: string,
): Promise<USSDSession> {
  const existing = await kv.get<USSDSession>(`ussd:${sessionId}`, 'json');
  if (existing) return existing;
  
  const session: USSDSession = {
    sessionId,
    phone,
    state: 'main_menu',
    data: {},
    createdAt: Date.now(),
  };
  await kv.put(`ussd:${sessionId}`, JSON.stringify(session), { expirationTtl: SESSION_TTL });
  return session;
}

export async function saveSession(kv: KVNamespace, session: USSDSession): Promise<void> {
  await kv.put(`ussd:${session.sessionId}`, JSON.stringify(session), { expirationTtl: SESSION_TTL });
}
```

**`src/menus.ts`** — USSD menu definitions:
```typescript
// USSD menu: *384#
// Main menu:
// 1. My Wallet
// 2. Send Money
// 3. Trending Now
// 4. Book Transport
// 5. Community

export function mainMenu(): string {
  return `CON Welcome to WebWaka
1. My Wallet
2. Send Money
3. Trending Now
4. Book Transport
5. Community`;
}

export function walletMenu(balanceKobo: number): string {
  const balanceNaira = (balanceKobo / 100).toFixed(2);
  return `CON My Wallet
Balance: ₦${balanceNaira}
1. Top Up Float
2. Transaction History
0. Back`;
}

export function endSession(message: string): string {
  return `END ${message}`;
}

// CON = continue session (shows menu)
// END = end session
```

**`src/processor.ts`** — input routing logic:
- Parse `text` field (pipe-delimited: `1*2*500` = main→wallet→send→₦500)
- Route to correct handler based on session state
- Transition session state
- Return `CON ...` or `END ...` response

**Tests required:**
- `src/session.test.ts` — create, get, expire, save
- `src/menus.test.ts` — menu formatting, CON vs END prefixes
- `src/processor.test.ts` — multi-step USSD flows (wallet balance, send money confirm)

---

## Deliverable 4 — `packages/pos` — `@webwaka/pos`

**Purpose:** POS terminal management + float double-entry ledger.

### `src/float-ledger.ts` — double-entry credit/debit:
```typescript
import type { D1Database } from '@cloudflare/workers-types';

export interface LedgerEntry {
  walletId: string;
  amountKobo: number;       // Platform Invariant T4 — integer kobo only
  transactionType: 'top_up' | 'cash_in' | 'cash_out' | 'commission' | 'reversal' | 'fee';
  reference: string;
  description?: string;
}

/**
 * Posts a double-entry ledger transaction.
 * 
 * Platform Invariant P9: All amounts are integer kobo. Never floats.
 * Ledger is append-only — no UPDATE or DELETE on float_ledger rows.
 * Reversals are new rows with negative amountKobo.
 */
export async function postLedgerEntry(
  db: D1Database,
  entry: LedgerEntry,
): Promise<{ id: string; runningBalanceKobo: number }> {
  // Get current balance
  const wallet = await db.prepare(
    'SELECT balance_kobo FROM agent_wallets WHERE id = ?'
  ).bind(entry.walletId).first<{ balance_kobo: number }>();
  
  if (!wallet) throw new Error(`Wallet not found: ${entry.walletId}`);
  
  const newBalance = wallet.balance_kobo + entry.amountKobo;
  
  // Guard: balance must not go below 0 for debits (unless credit_limit covers it)
  if (newBalance < 0) {
    throw new InsufficientFloatError(
      `Insufficient float: balance=${wallet.balance_kobo} kobo, debit=${Math.abs(entry.amountKobo)} kobo`
    );
  }
  
  const id = `flt_${crypto.randomUUID()}`;
  
  // Atomic: update wallet + insert ledger row
  const stmt1 = db.prepare('UPDATE agent_wallets SET balance_kobo = ?, updated_at = unixepoch() WHERE id = ?')
    .bind(newBalance, entry.walletId);
  const stmt2 = db.prepare(
    'INSERT INTO float_ledger (id, wallet_id, amount_kobo, running_balance_kobo, transaction_type, reference, description) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, entry.walletId, entry.amountKobo, newBalance, entry.transactionType, entry.reference, entry.description ?? null);
  
  await db.batch([stmt1, stmt2]);
  
  return { id, runningBalanceKobo: newBalance };
}

export class InsufficientFloatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientFloatError';
  }
}

/**
 * Reverse a ledger entry. Posts equal and opposite entry.
 * Ledger is append-only — no row deletion or mutation. (P9)
 */
export async function reverseLedgerEntry(
  db: D1Database,
  originalReference: string,
  reversalReference: string,
  reason: string,
): Promise<{ id: string; runningBalanceKobo: number }> {
  const original = await db.prepare(
    'SELECT * FROM float_ledger WHERE reference = ?'
  ).bind(originalReference).first<{ wallet_id: string; amount_kobo: number }>();
  
  if (!original) throw new Error(`Original entry not found: ${originalReference}`);
  
  return postLedgerEntry(db, {
    walletId: original.wallet_id,
    amountKobo: -original.amount_kobo,   // Equal and opposite
    transactionType: 'reversal',
    reference: reversalReference,
    description: `Reversal of ${originalReference}: ${reason}`,
  });
}
```

### `src/terminal.ts` — POS terminal CRUD:
- `registerTerminal(db, agentId, workspaceId, tenantId, terminalRef, model?)` — create terminal record
- `getTerminalByRef(db, terminalRef)` — lookup by hardware ID
- `updateTerminalLastSeen(db, terminalRef)` — heartbeat update
- `suspendTerminal(db, tenantId, terminalId)` — tenant-scoped status update

### `src/wallet.ts` — wallet management:
- `createAgentWallet(db, agentId, tenantId)` — idempotent (UNIQUE on agent_id)
- `getWalletBalance(db, agentId, tenantId)` — returns `{ balanceKobo, creditLimitKobo }`
- `getFloatHistory(db, walletId, limit?)` — paginated ledger entries

### `src/index.ts` — re-exports all

### `package.json`:
```json
{
  "name": "@webwaka/pos",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@webwaka/types": "workspace:*",
    "@webwaka/auth": "workspace:*"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20240620.0",
    "typescript": "^5.4.5",
    "vitest": "^1.6.0"
  }
}
```

### Tests required:
- `src/float-ledger.test.ts` — credit, debit, reversal, InsufficientFloatError, append-only invariant
- `src/wallet.test.ts` — create, balance, history
- Tests must verify: no floats used anywhere (all amounts validated as integers)

---

## Deliverable 5 — `apps/api` extensions — 4 new routes

Add to existing `apps/api/src/routes/`:

### `src/routes/sync.ts` — offline sync endpoint
```typescript
// POST /sync/apply
// Body: { clientId, entity, operation, payload }
// Returns: 200 (applied) | 409 (conflict) | 400 (invalid)

// Server-wins conflict resolution (P11):
// If a record was modified server-side after client's last sync, return 409 with server copy.
// Client marks item as 'conflict' in Dexie queue.
```

### `src/routes/pos.ts` — POS + float routes
```typescript
// POST /pos/terminals — register POS terminal
// POST /pos/float/credit — top up agent float
// POST /pos/float/debit — deduct from float
// GET  /pos/float/balance — get current balance
// GET  /pos/float/history — paginated ledger
// POST /pos/float/reverse — reverse a ledger entry
```

All POS routes must:
- Require `jwtAuthMiddleware`
- Require minimum `agent` role
- Validate all monetary amounts are integers (Zod: `z.number().int()`)
- Check KYC tier ≥ T1 before any float operation

### Tests required:
- `src/routes/sync.test.ts` — apply, conflict 409, invalid 400
- `src/routes/pos.test.ts` — all 6 POS endpoints

---

## M7b Non-Deliverables (Do NOT Implement)

- No Dexie.js in Worker runtime (Dexie is browser/PWA only — Workers use D1 directly)
- No Africa's Talking account setup — use mock responses in tests
- No NCC shortcode registration — USSD code is `*384#` as placeholder
- No `packages/community` or `packages/social` — those are M7c/M7d
- No direct pushes to `main`

---

## CI Requirements

All new packages must have:
1. `package.json` with `test` and `typecheck` scripts
2. `tsconfig.json` extending `../../tsconfig.base.json`
3. `vitest.config.ts` with `resolve.alias` for `@webwaka/*` workspace packages
4. `.eslintrc.json` extending `../../.eslintrc.base.json`

The `apps/ussd-gateway` must:
1. Use `@cloudflare/vitest-pool-workers` for route tests
2. Have its own `wrangler.toml` (no D1 binding required for unit tests)

---

## Advisory Notes from M7a (Address in M7b)

These were logged as non-blocking in the M7a QA report:

1. **CORS wildcard**: `cors.ts` currently uses `origin: '*'` for development. Switch to an `origin` function that reads `ALLOWED_ORIGINS` from Worker env. Fix before M7c.
2. **X-User-Id header source**: Confirm `X-User-Id` in `audit-log.ts` comes from verified JWT `sub` claim, not a client-supplied header.
3. **users vs individuals table**: A TDR is needed documenting the relationship between the `users` table (0013) and the `individuals` table (0002). File as a GitHub issue in M7b.

---

## PR Instructions

**Branch:** `feat/m7b-offline-ussd-pos`
**Base:** `main`
**Title:** `feat(m7b): Offline Sync (Dexie.js) + USSD Gateway + POS Float Ledger`
**Description must include:**
- Summary of all 5 deliverables
- D1 migrations added (0022–0025)
- Test count breakdown
- Advisory items addressed (CORS, X-User-Id, users/individuals TDR)
- CI status (link to passing run)

Tag in PR: `milestone-7`, `m7b`, `review-needed`, `base44`

---

## M7b Summary Checklist

```
[ ] Branch: feat/m7b-offline-ussd-pos from main
[ ] Migrations 0022–0025 (agents, pos_terminals, float_ledger, agent_sessions/sync_log)
[ ] packages/offline-sync — Dexie.js runtime (db.ts, adapter.ts, sync-engine.ts, offline-indicator.ts)
[ ] apps/ussd-gateway — Hono Worker, KV session, menus, processor
[ ] packages/pos — float-ledger.ts, terminal.ts, wallet.ts
[ ] apps/api extensions — /sync/apply, /pos/* (6 routes)
[ ] Advisory: CORS wildcard fix, X-User-Id confirmation, users/individuals TDR issue
[ ] All packages: package.json, tsconfig.json, vitest.config.ts, .eslintrc.json
[ ] CI green (all jobs)
[ ] PR opened: feat/m7b-offline-ussd-pos → main
[ ] Advisory items addressed
```

---

*Brief prepared by Base44 Super Agent (OpenClaw) — WebWaka OS governance and QA layer*
*2026-04-08 09:39 WAT*
