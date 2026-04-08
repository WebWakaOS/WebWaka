# Agent Network — M7 Enhancement Specification

**Status:** Draft — M7 Enhancement Baseline
**Author:** Base44 Super Agent (Milestone 7)
**Source:** Pre-Vertical Enhancement Research (Replit Agent 4, PR #18) — M6b scope
**Enhancements covered:** ENH-21 through ENH-37 (Offline/Agent category)
**Date:** 2026-04-08

---

## Overview

WebWaka's Agent Network enables the platform to operate across Nigeria's informal and semi-formal economy through:
- **Field agents** (human operators with mobile devices)
- **POS terminals** (hardware payment devices managed by agents)
- **Sub-agent delegation** (hierarchical agent networks, typical of Nigerian fintech)
- **USSD gateway** (feature-phone and low-connectivity access)

This is not optional for Nigerian market fit. ~40% of WebWaka's target user base is reachable primarily through agents or USSD, not smartphones with stable internet.

---

## Schema Migrations Required

### 0021 — POS Terminals
```sql
CREATE TABLE pos_terminals (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  terminal_ref    TEXT UNIQUE NOT NULL,   -- Hardware terminal ID
  agent_id        TEXT NOT NULL,          -- FK → agents
  workspace_id    TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'suspended' | 'decommissioned'
  model           TEXT,                   -- Hardware model (e.g. Verifone VX520)
  last_seen_at    INTEGER,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX idx_pos_agent ON pos_terminals(agent_id, status);
CREATE INDEX idx_pos_workspace ON pos_terminals(workspace_id);
```

### 0022 — Agent Wallets + Float Ledger
```sql
CREATE TABLE agent_wallets (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  agent_id        TEXT UNIQUE NOT NULL,   -- FK → agents
  balance_kobo    INTEGER NOT NULL DEFAULT 0,   -- Float balance in kobo
  credit_limit_kobo INTEGER NOT NULL DEFAULT 0,
  tenant_id       TEXT NOT NULL,
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE float_ledger (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  wallet_id       TEXT NOT NULL,          -- FK → agent_wallets
  amount_kobo     INTEGER NOT NULL,       -- Positive = credit, negative = debit
  transaction_type TEXT NOT NULL,         -- 'top_up' | 'cash_in' | 'cash_out' | 'commission' | 'reversal'
  reference       TEXT UNIQUE NOT NULL,
  description     TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX idx_float_wallet ON float_ledger(wallet_id, created_at DESC);
```

### 0023 — Agent Sessions + Handoff Log
```sql
-- Agent session tracking (Base44 addition to Replit spec)
CREATE TABLE agent_sessions (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  agent_id        TEXT NOT NULL,
  terminal_id     TEXT,                   -- FK → pos_terminals (nullable for mobile)
  started_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  ended_at        INTEGER,
  transaction_count INTEGER NOT NULL DEFAULT 0,
  total_kobo      INTEGER NOT NULL DEFAULT 0,
  sync_status     TEXT NOT NULL DEFAULT 'online',  -- 'online' | 'offline_queued' | 'synced'
  tenant_id       TEXT NOT NULL
);

CREATE TABLE agent_handoff_log (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  from_agent_id   TEXT NOT NULL,
  to_agent_id     TEXT NOT NULL,
  session_id      TEXT NOT NULL,
  handoff_reason  TEXT,                   -- 'shift_end' | 'terminal_swap' | 'dispute'
  amount_kobo     INTEGER NOT NULL DEFAULT 0,
  acknowledged_at INTEGER,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX idx_handoff_session ON agent_handoff_log(session_id);
CREATE INDEX idx_handoff_from ON agent_handoff_log(from_agent_id, created_at DESC);
```

### 0024 — Exchange Rates
```sql
CREATE TABLE exchange_rates (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  from_currency   TEXT NOT NULL DEFAULT 'USD',
  to_currency     TEXT NOT NULL DEFAULT 'NGN',
  rate_kobo       INTEGER NOT NULL,       -- Rate × 100 (e.g. ₦1,500/$1 = 150000)
  source          TEXT NOT NULL DEFAULT 'CBN',  -- 'CBN' | 'Paystack' | 'manual'
  effective_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE UNIQUE INDEX idx_exchange_latest ON exchange_rates(from_currency, to_currency, effective_at DESC);
```

---

## Super Agent → Sub-Agent Delegation API

Hierarchical agent model (standard in Nigerian fintech: super agents license sub-agents under CBN Agent Banking Guidelines):

```
POST /agents/register          → Register new agent (requires KYC Tier 2)
GET  /agents/me                → Agent profile + wallet balance
POST /agents/sub-agents        → Create sub-agent (super-agent only)
GET  /agents/sub-agents        → List sub-agents
POST /agents/float/topup       → Top up agent float
POST /agents/float/transfer    → Transfer float to sub-agent
GET  /agents/float/ledger      → Float transaction history
POST /agents/cash-in           → Record cash-in transaction
POST /agents/cash-out          → Record cash-out transaction
POST /agents/sessions/checkin  → Start agent session
POST /agents/sessions/checkout → End session + sync queue
GET  /agents/terminals         → List managed POS terminals
POST /agents/terminals/swap    → Terminal swap with handoff log
```

### Delegation Rules
- A Super Agent may create up to 10 Sub-Agents (Growth plan) or unlimited (Scale plan).
- Float transfer from Super → Sub requires Super's wallet balance ≥ transfer amount.
- Sub-agents cannot create further sub-agents (max 2 levels deep).
- All delegation bounded by entitlement check: `requireDelegationRight(ctx)`.

---

## USSD Gateway App

**Location:** `apps/ussd-gateway/`
**Runtime:** Cloudflare Worker
**Integration:** AfricasTalking USSD callback (primary) + Termii (secondary)

### Session Menu Structure
```
*384# → WebWaka OS
  1. My Profile
     1. View Profile
     2. Update Phone
     3. KYC Status
  2. My Wallet
     1. Balance
     2. Cash In
     3. Cash Out
     4. Transaction History
  3. Explore (geo-filtered)
     1. Trending in [LGA]
     2. Find Business
     3. Find Professional
  4. Agent Services (agent-only)
     1. Float Balance
     2. New Transaction
     3. End Session
  0. Exit
```

USSD sessions are stateful (AfricasTalking manages session ID). State stored in `WEBWAKA_KV` at `ussd:{sessionId}` with 5-minute TTL.

---

## Offline-First Architecture for Agents

### Sync Queue
Field agents frequently lose connectivity. All write operations (cash transactions, profile updates, form submissions) are queued in IndexedDB when offline.

```typescript
// packages/offline-sync (M7 runtime implementation — currently types-only)
SyncQueue.enqueue({
  type: 'agent_transaction',
  payload: { ... },
  priority: 'high',          // agent transactions are high priority
  created_at: Date.now(),
  retry_count: 0
})
```

### Conflict Resolution
- **Cash transactions:** Immutable once created. Conflicts resolved by timestamp + terminal_id. No merges — duplicates flagged for agent_handoff_log review.
- **Profile updates:** Last-write-wins with server clock as authority.
- **KYC records:** Server is always authoritative. Local KYC state is a cache only.

### Exponential Backoff Scheduler
```typescript
// Retry schedule: 30s → 60s → 2m → 5m → 15m → 1h → give up (flag for manual review)
SyncScheduler.schedule(queueItem, { maxRetries: 6, baseDelayMs: 30_000 })
```

---

## CBN Agent Banking Compliance

Under CBN Agent Banking Guidelines (2013, revised 2020):

| Requirement | WebWaka Implementation |
|---|---|
| Agent must be KYC Tier 2 minimum | `requireKYCTier(ctx, 2)` at agent registration |
| Agent transactions logged with terminal ID | `agent_sessions` + `float_ledger` |
| Super agent accountable for sub-agents | `agent_handoff_log` + delegation audit |
| Daily transaction limits per tier | Enforced via `@packages/entitlements` kyc-tiers.ts |
| Transaction reversal within 24h | `float_ledger` reversal entry + `transaction_type = 'reversal'` |
