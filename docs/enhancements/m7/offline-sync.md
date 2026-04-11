# Offline Sync — M7 Enhancement Specification

**Status:** Draft — M7 Enhancement Baseline
**Author:** Base44 Super Agent (Milestone 7)
**Source:** Pre-Vertical Enhancement Research (Replit Agent 4, PR #18) — M6b scope
**Enhancements covered:** ENH-21 (offline-sync runtime), ENH-36 (Lighthouse PWA CI), ENH-37 (offline indicator UI)
**Date:** 2026-04-08

---

## Overview

`packages/offline-sync` currently contains only type definitions (`SyncAdapter`, `SyncQueueItem`, `ConflictResolution`). This document specifies the full runtime implementation required for M7.

Offline-first is Platform Invariant P6 — it is not optional. Core user journeys must function without a network connection.

---

## Runtime Stack

| Layer | Technology | Purpose |
|---|---|---|
| Client storage | Dexie.js (IndexedDB wrapper) | Persistent offline queue |
| Background sync | Service Worker (`sync` event) | Auto-sync on reconnect |
| Cache strategy | Cache-first (static) + Network-first (API) | Offline page rendering |
| Conflict resolution | Deterministic (timestamp + entity rules) | No manual merges |
| Server side | D1 + KV | Sync endpoint + idempotency |

---

## Dexie.js Schema

```typescript
// packages/offline-sync/src/db.ts
import Dexie, { type Table } from 'dexie';

export interface SyncQueueItem {
  id?: number;                    // Auto-increment (Dexie)
  type: string;                   // 'create' | 'update' | 'delete' | 'agent_transaction'
  entity: string;                 // e.g. 'profiles', 'agent_transactions'
  payload: Record<string, unknown>;
  priority: 'critical' | 'high' | 'normal' | 'low';
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retry_count: number;
  next_retry_at: number;          // Unixepoch (ms)
  created_at: number;             // Unixepoch (ms)
  synced_at?: number;
  error?: string;
}

export class WebWakaOfflineDB extends Dexie {
  syncQueue!: Table<SyncQueueItem>;
  
  constructor() {
    super('webwaka_offline');
    this.version(1).stores({
      syncQueue: '++id, status, priority, next_retry_at, entity'
    });
  }
}

export const db = new WebWakaOfflineDB();
```

---

## SyncAdapter Runtime Implementation

```typescript
// packages/offline-sync/src/adapter.ts

export class WebWakaSyncAdapter implements SyncAdapter {
  
  async enqueue(item: Omit<SyncQueueItem, 'id' | 'status' | 'retry_count' | 'next_retry_at' | 'created_at'>): Promise<void> {
    await db.syncQueue.add({
      ...item,
      status: 'pending',
      retry_count: 0,
      next_retry_at: Date.now(),
      created_at: Date.now()
    });
    // Register background sync if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const sw = await navigator.serviceWorker.ready;
      await sw.sync.register('webwaka-sync');
    }
  }
  
  async flush(): Promise<SyncResult[]> {
    const items = await db.syncQueue
      .where('status').equals('pending')
      .and(item => item.next_retry_at <= Date.now())
      .sortBy('priority');  // critical → high → normal → low
    
    const results: SyncResult[] = [];
    for (const item of items) {
      results.push(await this.syncItem(item));
    }
    return results;
  }
  
  private async syncItem(item: SyncQueueItem): Promise<SyncResult> {
    await db.syncQueue.update(item.id!, { status: 'syncing' });
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `sync-${item.id}-${item.created_at}` },
        body: JSON.stringify({ type: item.type, entity: item.entity, payload: item.payload })
      });
      if (response.ok) {
        await db.syncQueue.update(item.id!, { status: 'synced', synced_at: Date.now() });
        return { id: item.id!, status: 'synced' };
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (err) {
      const nextDelay = this.backoffDelay(item.retry_count);
      if (item.retry_count >= 6) {
        await db.syncQueue.update(item.id!, { status: 'failed', error: String(err) });
        return { id: item.id!, status: 'failed', error: String(err) };
      }
      await db.syncQueue.update(item.id!, {
        status: 'pending',
        retry_count: item.retry_count + 1,
        next_retry_at: Date.now() + nextDelay,
        error: String(err)
      });
      return { id: item.id!, status: 'retry', retryAt: Date.now() + nextDelay };
    }
  }
  
  private backoffDelay(retryCount: number): number {
    // 30s → 60s → 2m → 5m → 15m → 1h
    const delays = [30_000, 60_000, 120_000, 300_000, 900_000, 3_600_000];
    return delays[Math.min(retryCount, delays.length - 1)];
  }
}
```

---

## Service Worker Registration

```typescript
// apps/frontend/src/sw-register.ts
export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  
  const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  
  // Listen for online event to trigger manual flush
  window.addEventListener('online', async () => {
    if (registration.sync) {
      await registration.sync.register('webwaka-sync');
    } else {
      // Fallback: direct flush if Background Sync not supported
      const { WebWakaSyncAdapter } = await import('@webwaka/offline-sync');
      await new WebWakaSyncAdapter().flush();
    }
  });
}
```

---

## Cache Strategy (Service Worker)

```javascript
// apps/frontend/public/sw.js

const STATIC_CACHE = 'webwaka-static-v1';
const API_CACHE = 'webwaka-api-v1';

// Static assets: cache-first
const STATIC_PATTERNS = [/\.(js|css|png|woff2|svg)$/];
// API routes: network-first with offline fallback
const API_PATTERNS = [/^\/api\/(profiles|feed|community|social)/];
// Always network (payments, auth, KYC)
const NETWORK_ONLY = [/^\/api\/(payments|identity|auth|claim\/verify)/];
```

**Cache-first** (static assets, course content, profile images):
- Serve from cache immediately
- Update cache in background (stale-while-revalidate)

**Network-first** (feeds, community posts, search results):
- Try network first (1s timeout)
- Fallback to cache if offline
- Show offline indicator

**Network-only** (payments, auth, KYC, OTP):
- Never serve from cache
- Show "You must be online to complete this action" offline message

---

## Offline Indicator UI Component

```typescript
// packages/design-system/src/components/OfflineIndicator.tsx
// Shows a sticky banner when navigator.onLine === false
// Displays pending sync count from db.syncQueue.where('status').equals('pending').count()
// Updates in real-time via Dexie liveQuery
```

---

## Lighthouse PWA CI Check

**Location:** `.github/workflows/lighthouse.yml`

```yaml
name: Lighthouse PWA Audit
on:
  pull_request:
    branches: [main, staging]
    paths: ['apps/frontend/**']
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: treosh/lighthouse-ci-action@v11
        with:
          urls: ${{ secrets.STAGING_URL }}
          budgetPath: .lighthouserc.json
          uploadArtifacts: true
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

```json
// .lighthouserc.json
{
  "assertions": {
    "categories:pwa": ["error", {"minScore": 0.80}],
    "categories:performance": ["warn", {"minScore": 0.70}],
    "categories:accessibility": ["error", {"minScore": 0.90}]
  }
}
```

Minimum PWA score of 80 is mandated by TDR-0010. This CI check enforces it.

---

## Test Plan

| Test | Location | Count |
|---|---|---|
| SyncAdapter enqueue + flush | packages/offline-sync/src/__tests__/adapter.test.ts | 8 |
| Conflict resolution determinism | packages/offline-sync/src/__tests__/conflicts.test.ts | 6 |
| Backoff delay calculation | packages/offline-sync/src/__tests__/backoff.test.ts | 4 |
| DB schema version migration | packages/offline-sync/src/__tests__/db.test.ts | 3 |
| Service Worker cache strategy | apps/frontend/src/__tests__/sw.test.ts | 5 |
| **Total** | | **26** |
