# ARC-16: Event Replay Procedures

**Phase 17 / Sprint 14 — WebWaka OS**

---

## Overview

WebWaka OS uses `discovery_events`, `audit_log`, and `billing_history` tables as append-only event stores. These tables are the source of truth for analytics, debugging, and dispute resolution. This document describes how to replay or re-process events when needed — for example, after a bug fix or during disaster recovery.

---

## 1. When to replay events

Replay is appropriate when:

- A bug caused events to be written with incorrect metadata.
- A downstream consumer (analytics, billing enforcement) crashed mid-processing.
- A migration added a new column that needs to be backfilled from existing event data.
- Audit requirements demand re-aggregation over a historical window.

**Do not replay events to fix business logic errors** (e.g., refunds). Use compensating transactions instead.

---

## 2. Replaying discovery_events

### 2a. Re-aggregate trending counts

If the `discovery_events` table is intact but a downstream aggregation is stale:

```sql
-- Re-count profile views for the last 7 days
SELECT entity_id, entity_type, COUNT(*) as view_count
FROM discovery_events
WHERE event_type = 'profile_view'
  AND created_at > (unixepoch() - 604800)
GROUP BY entity_id, entity_type
ORDER BY view_count DESC
LIMIT 100;
```

Store the result in KV or a materialized table if a caching layer is needed.

### 2b. Backfill a new metadata column

```sql
-- Example: backfill a missing 'tenant_id' column on discovery_events
-- (only relevant if such a column is added in a future migration)
UPDATE discovery_events
SET tenant_id = (
  SELECT se.tenant_id FROM search_entries se
  WHERE se.entity_id = discovery_events.entity_id
  LIMIT 1
)
WHERE tenant_id IS NULL;
```

---

## 3. Replaying billing_history

### 3a. Re-trigger subscription enforcement

The enforcement route (`POST /billing/enforce`) is idempotent and can be re-run:

```bash
curl -X POST https://api.webwaka.com/billing/enforce \
  -H "Authorization: Bearer $ADMIN_JWT"
```

This will re-evaluate all active subscriptions and transition expired ones to `past_due` or `suspended`.

### 3b. Reconstruct plan history from billing_history

If `subscription_plan_history` is missing entries (e.g., from a migration gap), reconstruct from billing events:

```sql
-- Find plan changes implied by successful billing events
SELECT bh.workspace_id, bh.amount, bh.status, bh.created_at,
       s.plan, s.status as sub_status
FROM billing_history bh
JOIN subscriptions s ON s.workspace_id = bh.workspace_id
WHERE bh.status = 'success'
ORDER BY bh.workspace_id, bh.created_at DESC;
```

---

## 4. Replaying audit_log entries

The `audit_log` table is append-only and should never be modified. To replay for a downstream consumer:

```sql
-- Get all audit events for a workspace in chronological order
SELECT id, actor_id, action, resource_type, resource_id, tenant_id,
       datetime(created_at, 'unixepoch') AS occurred_at, metadata
FROM audit_log
WHERE tenant_id = 'tnt_XXXX'
ORDER BY created_at ASC;
```

Pass these rows to the consumer in batches of 100–1000 rows using `OFFSET`.

---

## 5. Safe replay checklist

Before replaying events in production:

- [ ] Take a D1 snapshot (Cloudflare Dashboard → D1 → Export).
- [ ] Replay in a staging environment first.
- [ ] Ensure the consumer is idempotent (uses the event `id` as a deduplication key).
- [ ] Monitor the `audit_log` table for unexpected side effects.
- [ ] Coordinate with ops to avoid concurrent enforcement runs.

---

## 6. Rollback

If a replay produces incorrect results:

1. Stop the replay process.
2. Identify the incorrectly written rows by `created_at` range.
3. For append-only tables: insert compensating events (e.g., `type = 'replay_correction'`).
4. For mutable tables (subscriptions, search_entries): restore from the D1 snapshot.

```sql
-- Example compensating event in audit_log
INSERT INTO audit_log (id, actor_id, action, resource_type, resource_id, tenant_id, created_at, metadata)
VALUES (
  'aud_' || lower(hex(randomblob(8))),
  'system',
  'replay_correction',
  'event_replay',
  'replay_20260414',
  'tnt_XXXX',
  unixepoch(),
  '{"reason":"incorrect trending aggregation from 2026-04-14 replay"}'
);
```
