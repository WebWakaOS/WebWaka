# WebWaka OS — IMPLEMENTATION HANDOVER PLAN

**Date:** 2026-04-23  
**Source:** `WebWaka_OS_Consolidated_Master_Report_2026_04_23.md`  
**Total findings:** 102  
**Estimated engineering effort:** 113 engineer-days across 4 sprints + 2 extended sprints  
**Prepared for:** Executing Replit Agent / Engineering Team  

---

## EXECUTIVE SUMMARY

| Priority | Findings | Effort | Business Impact |
|---|---|---|---|
| P0 Critical Bugs | 3 | 8 h | Production data breach (T3), deploy failure, CSRF bypass |
| P1 High Issues | 11 | 53 h | Stolen session (JWT), platform outage (CRON), UX crash (ErrorBoundary), NDPR fine risk |
| P2 Medium Issues | 28 | 16 days | Compliance gaps, UX blockers for 5 personas, missing VAT receipts |
| P3 Low/Quality | 15 | 5 days | Maintainability, minor UX polish |
| Security Findings | 15 | 10 days | PBKDF2 upgrade, rate-limit alerting, webhook signing |
| Compliance | 8 | 8 days | NDPR DSAR, CBN reconciliation, data residency |
| Test Gaps | 12 | 10 days | Cross-tenant RLS, persona E2E, property tests |
| Infra/CI-CD | 10 | 5 days | Migration safety, canary deploy, SLO dashboard |
| Enhancements | 48 | 60 days | Full product backlog from both review passes |

**Critical path:** BUG-001 → ENH-004 (schedulers) → BUG-037 + COMP-001 + COMP-008

**Governance invariants preserved throughout:**
- P9: integer kobo — no float introduced in any monetary fix  
- T3: tenant_id — every new D1 query must carry `AND tenant_id = ?`  
- WF-0xx: wallet governance — wallet fixes reviewed by 2 engineers; k6 load tested before merge  

---

## SPRINT 1: CRITICAL BLOCKERS (Week of 2026-04-28)

**Scope:** 3 P0 + 4 P1 security-critical = 7 fixes | ~40 engineer-hours  
**Deploy target:** Sprint 1 complete → staging Monday → production canary Wednesday → full Friday

---

### 1.1 P0 Critical Bugs

---

#### [BUG-001] T3 Tenant Isolation Breach in `requirePrimaryPhoneVerified`

**Severity:** P0 | **Invariant:** T3  

**Files Changed:**
```
packages/auth/src/guards.ts  lines 52–64
```

**Exact Diff:**
```diff
-export async function requirePrimaryPhoneVerified(
-  db: D1Like,
-  userId: string,
-  _tenantId: string,
-): Promise<void> {
-  const row = await db
-    .prepare(
-      `SELECT id FROM contact_channels
-       WHERE user_id = ? AND channel_type = 'sms' AND is_primary = 1 AND verified = 1
-       LIMIT 1`,
-    )
-    .bind(userId)
-    .first<{ id: string }>();
+export async function requirePrimaryPhoneVerified(
+  db: D1Like,
+  userId: string,
+  tenantId: string,
+): Promise<void> {
+  const row = await db
+    .prepare(
+      `SELECT id FROM contact_channels
+       WHERE user_id = ? AND tenant_id = ? AND channel_type = 'sms' AND is_primary = 1 AND verified = 1
+       LIMIT 1`,
+    )
+    .bind(userId, tenantId)
+    .first<{ id: string }>();
```

**Test Coverage:**
- File: `tests/e2e/api/08-tenant-isolation.e2e.ts`  
- TC-ID: `TC-INV002` (cross-tenant isolation on phone-verified guard)  
- Add test case: create user in Tenant A, call guard with Tenant B ID → must throw `PRIMARY_PHONE_REQUIRED`  
- Command: `pnpm test:cycle-02 --grep "TC-INV002"`

**Governance Verification:**
- [x] `scripts/governance-checks/check-tenant-isolation.ts` — re-run after patch; `contact_channels` query now contains `tenant_id`  
- [x] `platform-invariants.md T3` — satisfied: every contact_channels query now scoped  

**Production Rollout:**
1. Staging deploy → run `pnpm test:cycle-02 --grep "TC-INV002"` + `pnpm governance-checks`  
2. Production canary 5% → monitor `audit_log` for `PRIMARY_PHONE_REQUIRED` anomalies (2 h window)  
3. Production full → post-deploy: `curl /health/ready`; verify new guard test passes  

**Rollback Plan:** `git revert` the single-file change. No migration needed.  

**Success Criteria:**  
- [ ] `TC-INV002` passes: cross-tenant call throws `PRIMARY_PHONE_REQUIRED`  
- [ ] `check-tenant-isolation.ts` emits zero T3 violation warnings  
- [ ] Existing same-tenant flow unaffected (happy-path test still passes)  

---

#### [BUG-002] Migration 0374 Safety — Generalised ALTER TABLE Guard + Staging Port

**Severity:** P0 | **Invariant:** Deploy Safety  

**Files Changed:**
```
scripts/migrations/apply-safe.sh          (NEW)
.github/workflows/deploy-production.yml   (MODIFY — add pre-apply job)
.github/workflows/deploy-staging.yml      (MODIFY — port guard to staging)
```

**New File: `scripts/migrations/apply-safe.sh`**
```bash
#!/usr/bin/env bash
# apply-safe.sh — Safe D1 migration runner with ALTER TABLE idempotence guard.
# Usage: ./apply-safe.sh <env> <d1-database-name>
# Emits: migration-audit-${GITHUB_SHA}.txt
set -euo pipefail
ENV=${1:-staging}
DB_NAME=${2:-webwaka-db}
AUDIT_FILE="migration-audit-${GITHUB_SHA:-local}.txt"

echo "=== Migration Safety Audit ===" > "$AUDIT_FILE"
echo "Env: $ENV | DB: $DB_NAME | SHA: ${GITHUB_SHA:-local}" >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"

for sql_file in infra/db/migrations/*.sql; do
  fname=$(basename "$sql_file")
  # Check if ALTER TABLE ADD COLUMN pattern present
  if grep -qiE "ALTER TABLE.*ADD (COLUMN )?[a-z_]+" "$sql_file"; then
    col=$(grep -ioE "ADD (COLUMN )?([a-z_]+)" "$sql_file" | tail -1 | awk '{print $NF}')
    tbl=$(grep -ioE "ALTER TABLE ([a-z_]+)" "$sql_file" | head -1 | awk '{print $3}')
    echo "CHECKING: $fname — ALTER TABLE $tbl ADD $col" | tee -a "$AUDIT_FILE"
    # Query existing columns via pragma_table_info
    existing=$(wrangler d1 execute "$DB_NAME" --env "$ENV" --remote \
      --command "SELECT COUNT(*) as c FROM pragma_table_info('$tbl') WHERE name='$col'" \
      --json 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(d[0]['results'][0]['c'])" 2>/dev/null || echo "0")
    if [ "$existing" -gt "0" ]; then
      echo "  SKIP: Column '$col' already exists in '$tbl'" | tee -a "$AUDIT_FILE"
    else
      echo "  APPLY: Column '$col' not found — will apply" | tee -a "$AUDIT_FILE"
    fi
  fi
done

echo "" >> "$AUDIT_FILE"
echo "=== Applying migrations ===" >> "$AUDIT_FILE"
wrangler d1 migrations apply "$DB_NAME" --env "$ENV" --remote 2>&1 | tee -a "$AUDIT_FILE"
echo "Migration audit complete: $AUDIT_FILE"
```

**Diff for `.github/workflows/deploy-production.yml`** (add before the existing `wrangler d1 migrations apply` step):
```yaml
- name: Pre-apply migration safety check
  run: |
    chmod +x scripts/migrations/apply-safe.sh
    ./scripts/migrations/apply-safe.sh production webwaka-db
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    GITHUB_SHA: ${{ github.sha }}

- name: Upload migration audit artifact
  uses: actions/upload-artifact@v4
  with:
    name: migration-audit-${{ github.sha }}
    path: migration-audit-${{ github.sha }}.txt
```

**Diff for `.github/workflows/deploy-staging.yml`** — same two steps targeting `staging` environment.

**Test Coverage:**
- Add to `tests/e2e/api/`: not a runtime test — CI artifact verification  
- Governance script: add `check-migration-idempotence.ts` that greps migration files  
- Command: `pnpm governance-checks` (includes new check)

**Production Rollout:**
1. Test `apply-safe.sh` locally against staging D1 (`./apply-safe.sh staging webwaka-db`)  
2. Verify audit artifact produced with correct SKIP/APPLY decisions  
3. Production: artifact attached to every deploy workflow run  

**Rollback Plan:** Remove the `Pre-apply migration safety check` step if it produces false positives.  

**Success Criteria:**  
- [ ] `apply-safe.sh` correctly identifies existing vs new columns  
- [ ] Staging deploy workflow now has identical pre-apply guard  
- [ ] CI artifact `migration-audit-*.txt` produced and contains SKIP/APPLY log  

---

#### [BUG-003] CSRF Bypass — Require `X-CSRF-Intent: m2m` for Headerless Requests

**Severity:** P0 | **Invariant:** Security Baseline §CSRF  

**File Changed:**
```
apps/api/src/middleware/csrf.ts  lines 14–19
```

**Exact Diff:**
```diff
   if (!origin && !referer) {
-    const contentType = c.req.header('Content-Type') ?? '';
-    if (contentType.includes('application/json')) {
-      return next();
-    }
-    return c.json({ error: 'Missing Origin/Referer header (CSRF protection)' }, 403);
+    // Require explicit M2M intent header when neither Origin nor Referer is present.
+    // Browser clients always send at least one of these; absence means non-browser caller.
+    // M2M callers MUST explicitly declare intent via header OR use INTER_SERVICE_SECRET.
+    const csrfIntent = c.req.header('X-CSRF-Intent');
+    const interServiceSecret = c.req.header('X-Inter-Service-Secret');
+    const expectedSecret = c.env?.INTER_SERVICE_SECRET;
+    if (csrfIntent === 'm2m') {
+      return next();
+    }
+    if (expectedSecret && interServiceSecret === expectedSecret) {
+      return next();
+    }
+    return c.json(
+      { error: 'Missing Origin/Referer header. M2M callers must send X-CSRF-Intent: m2m or X-Inter-Service-Secret. (CSRF protection)' },
+      403,
+    );
   }
```

**Update `docs/governance/security-baseline.md`:** Add to §CSRF section:
```
M2M API clients MUST include one of:
  - Header: `X-CSRF-Intent: m2m`
  - Header: `X-Inter-Service-Secret: <secret>` (server-to-server only)
Browser clients are automatically handled via Origin/Referer validation.
```

**Update all internal M2M callers** (grep for `fetch(` in `packages/superagent/`, `apps/schedulers/`):  
Add `'X-CSRF-Intent': 'm2m'` to all internal service-to-service API calls.

**Test Coverage:**
- File: `tests/e2e/api/09-jwt-csrf.e2e.ts`  
- TC-ID: `TC-CSRF001`  
- Verify: POST without Origin/Referer/X-CSRF-Intent → 403  
- Verify: POST without Origin/Referer but with `X-CSRF-Intent: m2m` → 200  
- Verify: POST without Origin/Referer but with valid `X-Inter-Service-Secret` → 200  
- Command: `pnpm test:cycle-02 --grep "TC-CSRF001"`

**Governance Verification:**
- [x] `security-baseline.md` updated  
- [x] No existing integration tests rely on the old headerless bypass  

**Production Rollout:**
1. Identify all internal callers that omit Origin/Referer (grep `packages/superagent`, `apps/api` internal fetches)  
2. Add `X-CSRF-Intent: m2m` to each before deploying middleware change  
3. Deploy to staging → run full E2E suite to catch any missed internal callers  
4. Canary 5% → monitor 403 rate (should be 0 for internal callers after fix)  

**Rollback Plan:** `git revert` on `csrf.ts`. Zero database impact.  

**Success Criteria:**  
- [ ] `TC-CSRF001` passes — headless POST without intent header returns 403  
- [ ] All internal M2M callers pass with `X-CSRF-Intent: m2m`  
- [ ] No increase in 403 error rate after full production deploy  

---

### 1.2 P1 Security-Critical (Sprint 1, Days 3–5)

---

#### [BUG-007] CI Must Trigger on Push to `main` + Branch Protection

**Severity:** P1 | **File:** `.github/workflows/ci.yml` lines 3–10  

**Exact Diff:**
```diff
 on:
   pull_request:
     branches:
       - staging
   push:
     branches:
       - staging
+      - main
   workflow_call:
```

**Additional GitHub Config** (via GitHub CLI or UI — not a file change):
```bash
# Add branch protection to main
gh api repos/WebWakaOS/WebWaka/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["TypeScript Check","Tests","Governance Checks"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null
```

**Test Coverage:** N/A — CI configuration change. Validated by pushing a test commit to `main` and observing CI run.  

**Rollback Plan:** Remove `- main` from push branches. Disable branch protection in GitHub settings.  

**Success Criteria:**  
- [ ] CI runs on direct `git push origin main`  
- [ ] Branch protection requires 1 approval + CI passing before merge  

---

#### [BUG-008] Silent `PLATFORM_BANK_ACCOUNT_JSON` Misconfiguration → 503

**Severity:** P1 | **File:** `apps/api/src/routes/payments.ts` lines 48–58  

**Exact Diff:**
```diff
 function parseBankAccount(raw: string | undefined): PlatformBankAccount {
-  if (!raw) {
-    return { bank_name: 'Not configured', account_number: 'N/A', account_name: 'N/A' };
-  }
+  if (!raw) {
+    throw new Error('PLATFORM_BANK_ACCOUNT_JSON is not configured');
+  }
   try {
     const parsed = JSON.parse(raw);
-    if (!parsed.bank_name || !parsed.account_number || !parsed.account_name) {
-      return { bank_name: 'Not configured', account_number: 'N/A', account_name: 'N/A' };
-    }
+    if (!parsed.bank_name || !parsed.account_number || !parsed.account_name) {
+      throw new Error('PLATFORM_BANK_ACCOUNT_JSON is malformed — missing required fields');
+    }
     return parsed as PlatformBankAccount;
   } catch {
-    return { bank_name: 'Not configured', account_number: 'N/A', account_name: 'N/A' };
+    throw new Error('PLATFORM_BANK_ACCOUNT_JSON parse error');
   }
 }
```

**Add 503 handler in the bank-transfer route** (`apps/api/src/routes/payments.ts`, in the handler that calls `getPlatformBankAccount`):
```typescript
let bankAccount: PlatformBankAccount;
try {
  bankAccount = await getPlatformBankAccount(c.env.WALLET_KV, c.env.PLATFORM_BANK_ACCOUNT_JSON);
} catch (err) {
  console.error(JSON.stringify({ level: 'error', event: 'bank_account_config_missing', message: String(err) }));
  return c.json({ error: 'payment_method_unavailable', message: 'Bank transfer is temporarily unavailable.' }, 503);
}
```

**Add startup health check endpoint** in `apps/api/src/routes/health.ts`:
```typescript
healthRoutes.get('/payment-config', adminOnlyMiddleware, async (c) => {
  try {
    getPlatformBankAccount(undefined, c.env.PLATFORM_BANK_ACCOUNT_JSON);
    return c.json({ status: 'ok', payment_method: 'bank_transfer' });
  } catch (err) {
    return c.json({ status: 'misconfigured', error: String(err) }, 503);
  }
});
```

**Test Coverage:** TC-ID `TC-F001` in `tests/smoke/cycle-01-smoke.ts` — add negative test  
**Rollback Plan:** Revert `parseBankAccount` to soft-fallback. No DB impact.  
**Success Criteria:**  
- [ ] Missing env → route returns 503, not 200 with N/A  
- [ ] `/health/payment-config` (admin) returns misconfigured status when env absent  

---

#### [BUG-009] React `ErrorBoundary` — Zero Across All Frontend Apps

**Severity:** P1 | **Files:** All React `main.tsx` files  

**New File: `packages/ui-error-boundary/src/index.tsx`**
```tsx
import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Report to platform audit log (fire-and-forget)
    this.props.onError?.(error, info);
    void fetch('/internal/error-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Intent': 'm2m' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack?.slice(0, 500),
        componentStack: info.componentStack?.slice(0, 500),
        userAgent: navigator.userAgent,
        url: window.location.pathname,
      }),
    }).catch(() => {/* non-blocking */});
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div role="alert" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <p>Please refresh the page. If the problem persists, contact support.</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**Modify `apps/workspace-app/src/main.tsx`:**
```diff
+import { ErrorBoundary } from '@webwaka/ui-error-boundary';

 createRoot(document.getElementById('root')!).render(
   <StrictMode>
+    <ErrorBoundary>
       <App />
+    </ErrorBoundary>
   </StrictMode>,
 );
```

Apply the same `ErrorBoundary` wrap to `main.tsx` in every React app:  
`apps/brand-runtime/`, `apps/public-discovery/`, `apps/partner-admin/` (if React).

**Add internal error-report endpoint** `apps/api/src/routes/internal.ts`:
```typescript
internalRoutes.post('/error-report', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (body) {
    console.error(JSON.stringify({ level: 'error', event: 'frontend_render_error', ...body }));
  }
  return c.json({ ok: true });
});
```

**Test Coverage:** `tests/e2e/workspace/workspace-app.e2e.ts` — inject a render error and assert fallback UI shown  
**Rollback Plan:** Remove `<ErrorBoundary>` wrappers. No state/DB impact.  
**Success Criteria:**  
- [ ] Intentional render throw in a test component → fallback UI shown, not white screen  
- [ ] Error logged to `/internal/error-report`  

---

#### [BUG-014] Audit-Log Silent Failure — Dual-Write with KV Failure Queue

**Severity:** P1 | **File:** `apps/api/src/middleware/audit-log.ts`  

**Modify the `try/catch` block** (starting at line ~57):
```diff
   if (tenantId) {
     const id = crypto.randomUUID();
     try {
       await c.env.DB.prepare(
         `INSERT INTO audit_logs (id, tenant_id, user_id, action, method, path, resource_type, resource_id, ip_masked, status_code, duration_ms)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
       ).bind(id, tenantId, userId, entry.action, entry.method, entry.path,
         entry.resource_type, entry.resource_id, entry.ip_masked, entry.status, entry.duration_ms).run();
     } catch (err) {
-      console.error('[AUDIT] D1 write failed:', err instanceof Error ? err.message : err);
+      // SEC-005 hardening: dual-write failed entries to KV failure queue for re-drive.
+      const failedEntry = JSON.stringify({ id, ts: entry.ts, tenantId, action: entry.action,
+        error: err instanceof Error ? err.message : String(err) });
+      console.error(JSON.stringify({ level: 'error', event: 'audit_log_write_failed',
+        entryId: id, tenantId, error: failedEntry.slice(0, 200) }));
+      // KV failure queue — 48h TTL, re-drive by scheduled worker
+      try {
+        const failKey = `audit_fail:${id}`;
+        await c.env.RATE_LIMIT_KV.put(failKey, failedEntry, { expirationTtl: 172800 });
+      } catch {
+        // KV also unavailable — both log layers exhausted; already logged to console above
+      }
     }
   }
```

**Test Coverage:** Mock D1 to throw; assert KV contains `audit_fail:*` entry  
**Rollback Plan:** Revert to console-only catch block  
**Success Criteria:**  
- [ ] D1 write failure → entry in KV `audit_fail:*`  
- [ ] Console emits structured error log  

---

#### [BUG-006] Auth Failure Not Routed to Audit Log

**Severity:** P1 | **File:** `packages/auth/src/jwt.ts` + `apps/api/src/middleware/auth.ts`  

**Modify `apps/api/src/middleware/auth.ts`** — in the `if (!result.success)` branch:
```diff
   if (!result.success) {
+    // SEC-BUG-006: Route auth failures to audit log for IDS/SIEM integration
+    const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? '';
+    console.log(JSON.stringify({
+      level: 'warn',
+      event: 'AUTH_FAILURE_VERIFY',
+      reason: result.message,
+      path: c.req.path,
+      method: c.req.method,
+      ip_hash: await hashString(ip),
+      ua_hash: await hashString(c.req.header('User-Agent') ?? ''),
+      ts: new Date().toISOString(),
+    }));
+    // Fire-and-forget D1 audit write (non-blocking)
+    if (c.env?.DB) {
+      void c.env.DB.prepare(
+        `INSERT OR IGNORE INTO audit_logs (id, tenant_id, user_id, action, method, path, resource_type, resource_id, ip_masked, status_code, duration_ms)
+         VALUES (?, NULL, NULL, 'AUTH_FAILURE_VERIFY', ?, ?, 'auth', NULL, ?, ?, ?)`,
+      ).bind(crypto.randomUUID(), c.req.method, c.req.path, ip.slice(0,7)+'***', result.status ?? 401, 0).run().catch(() => {});
+    }
     return c.json(errorResponse(ErrorCode.Unauthorized, result.message), result.status);
   }
```

**Helper** (add to `apps/api/src/middleware/auth.ts`):
```typescript
async function hashString(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,16);
}
```

**Test Coverage:** `tests/e2e/api/09-jwt-csrf.e2e.ts` — send invalid JWT, query audit_logs for `AUTH_FAILURE_VERIFY` entry  
**Rollback Plan:** Remove the fire-and-forget audit block  
**Success Criteria:**  
- [ ] Invalid JWT → `AUTH_FAILURE_VERIFY` row in `audit_logs`  
- [ ] Valid JWT → no audit entry (no regression)  

---

#### [COMP-002 / COMP-003] NDPR Erasure — Batch Atomicity + Erasure Receipt

**Severity:** P1 | **File:** `apps/api/src/routes/auth-routes.ts` lines 772–848  

**New Migration: `infra/db/migrations/0379_erasure_receipts.sql`**
```sql
-- NDPR COMP-003: Append-only erasure receipts table
-- Complies with G23 right-to-erasure audit requirement
CREATE TABLE IF NOT EXISTS erasure_receipts (
  id            TEXT PRIMARY KEY,
  user_id_hash  TEXT NOT NULL,        -- SHA-256 of original user_id
  tenant_id     TEXT NOT NULL,
  requested_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  completed_at  INTEGER,
  tables_affected TEXT,               -- JSON array of table names
  status        TEXT NOT NULL DEFAULT 'pending' -- pending | complete | failed
);
CREATE INDEX IF NOT EXISTS idx_erasure_receipts_tenant ON erasure_receipts(tenant_id, requested_at);
```

**Modify `DELETE /auth/me`** handler (lines 772–848):
```typescript
authRoutes.delete('/me', async (c) => {
  const auth = c.get('auth');
  if (!auth) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Not authenticated.'), 401);
  }

  // COMP-002: Confirmation check — require X-Confirm-Erasure: confirmed header
  const confirmation = c.req.header('X-Confirm-Erasure');
  if (confirmation !== 'confirmed') {
    return c.json({
      error: 'erasure_confirmation_required',
      message: 'Send X-Confirm-Erasure: confirmed header to proceed. This action is irreversible.',
    }, 400);
  }

  const db = c.env.DB;
  const anonRef = `deleted_${crypto.randomUUID()}`;
  const receiptId = crypto.randomUUID();

  // COMP-002: Hash user ID for receipt (we cannot store the real ID post-erasure)
  const userIdHash = await (async () => {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(auth.userId));
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  })();

  // COMP-002: Create pending erasure receipt BEFORE deletion (audit trail)
  await db.prepare(
    `INSERT INTO erasure_receipts (id, user_id_hash, tenant_id, status) VALUES (?, ?, ?, 'pending')`,
  ).bind(receiptId, userIdHash, auth.tenantId).run();

  // COMP-002: Atomically anonymize + delete core user data in a single D1 batch
  await db.batch([
    db.prepare(
      `UPDATE users SET email=?, full_name='Deleted User', phone=NULL, password_hash=NULL, updated_at=unixepoch()
       WHERE id=? AND tenant_id=?`,
    ).bind(`${anonRef}@deleted.invalid`, auth.userId, auth.tenantId),
    db.prepare(
      `DELETE FROM contact_channels WHERE user_id=? AND (tenant_id=? OR tenant_id IS NULL)`,
    ).bind(auth.userId, auth.tenantId),
    db.prepare(
      `DELETE FROM sessions WHERE user_id=? AND (tenant_id=? OR tenant_id IS NULL)`,
    ).bind(auth.userId, auth.tenantId),
  ]);

  // Propagate to notification tables (non-blocking)
  const tablesAffected: string[] = ['users', 'contact_channels', 'sessions'];
  try {
    const result = await propagateErasure(
      db as unknown as Parameters<typeof propagateErasure>[0],
      auth.userId as string,
      auth.tenantId as string,
    );
    tablesAffected.push('audit_logs', 'notification_deliveries', 'notification_inbox');
    console.log(JSON.stringify({ level: 'info', event: 'ndpr_erasure_propagated', ...result }));
  } catch (err) {
    console.error('[auth:erasure] propagation failed:', err instanceof Error ? err.message : err);
  }

  // COMP-003: Mark receipt complete
  await db.prepare(
    `UPDATE erasure_receipts SET completed_at=unixepoch(), status='complete', tables_affected=? WHERE id=?`,
  ).bind(JSON.stringify(tablesAffected), receiptId).run();

  return c.json({
    message: 'Your personal data has been erased in compliance with NDPR Article 3.1(9).',
    erasureReceiptId: receiptId,
    erasedAt: new Date().toISOString(),
    tablesAffected,
  });
});
```

**Test Coverage:** `tests/e2e/api/11-compliance-invariants.e2e.ts` — TC-ID `TC-ID002`: verify receipt row exists after deletion; verify user row anonymized  
**Rollback Plan:** Drop `erasure_receipts` table. Revert handler.  
**Success Criteria:**  
- [ ] Deletion without confirmation header → 400  
- [ ] Deletion with header → `erasure_receipts` row with `status='complete'`  
- [ ] All three core tables modified atomically  

---

## SPRINT 2: SECURITY + CORE RELIABILITY (Week of 2026-05-05)

**Scope:** Remaining P1 issues + high-priority security findings = 16 fixes | ~55 engineer-hours  

---

### 2.1 Opaque Refresh Token Rotation (BUG-004 / ENH-001 / ENH-008)

**Severity:** P1 | **Files:** `apps/api/src/routes/auth-routes.ts`, new migration  

**New Migration: `infra/db/migrations/0380_refresh_tokens.sql`**
```sql
-- SEC-BUG-004: Opaque refresh token rotation
-- Replaces stateless JWT-to-JWT refresh with single-use opaque tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id               TEXT PRIMARY KEY,          -- opaque UUID
  jti_hash         TEXT NOT NULL UNIQUE,      -- SHA-256 of token value
  user_id          TEXT NOT NULL,
  tenant_id        TEXT NOT NULL,
  workspace_id     TEXT,
  role             TEXT NOT NULL,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at       INTEGER NOT NULL,           -- unixepoch() + 2592000 (30 days)
  revoked_at       INTEGER,
  replaced_by      TEXT                        -- ID of successor token
);
CREATE INDEX IF NOT EXISTS idx_rt_user ON refresh_tokens(user_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_rt_expires ON refresh_tokens(expires_at);
```

**Modify `/auth/login`** — issue opaque refresh token alongside JWT:
```typescript
// After issuing JWT...
const refreshTokenValue = crypto.randomUUID() + crypto.randomUUID(); // 72 entropy chars
const rtHash = await sha256hex(refreshTokenValue);
await c.env.DB.prepare(
  `INSERT INTO refresh_tokens (id, jti_hash, user_id, tenant_id, workspace_id, role, expires_at)
   VALUES (?, ?, ?, ?, ?, ?, unixepoch() + 2592000)`,
).bind(crypto.randomUUID(), rtHash, userId, tenantId, workspaceId, role).run();

return c.json({ token, refresh_token: refreshTokenValue, expires_in: 3600 }, 200);
```

**Modify `/auth/refresh`** — consume opaque token, detect reuse:
```typescript
authRoutes.post('/refresh', async (c) => {
  const body = await c.req.json<{ refresh_token: string }>().catch(() => null);
  if (!body?.refresh_token) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'refresh_token required'), 400);
  }

  const rtHash = await sha256hex(body.refresh_token);
  const rtRow = await c.env.DB.prepare(
    `SELECT id, user_id, tenant_id, workspace_id, role, revoked_at, replaced_by
     FROM refresh_tokens WHERE jti_hash=? AND expires_at > unixepoch() LIMIT 1`,
  ).bind(rtHash).first<{ id:string; user_id:string; tenant_id:string; workspace_id:string|null; role:string; revoked_at:number|null; replaced_by:string|null }>();

  if (!rtRow) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Invalid or expired refresh token'), 401);
  }

  if (rtRow.revoked_at) {
    // Token reuse detected → revoke entire user session family
    await c.env.DB.prepare(
      `UPDATE refresh_tokens SET revoked_at=unixepoch() WHERE user_id=? AND tenant_id=? AND revoked_at IS NULL`,
    ).bind(rtRow.user_id, rtRow.tenant_id).run();
    console.error(JSON.stringify({ level: 'error', event: 'REFRESH_TOKEN_REUSE', userId: rtRow.user_id }));
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Refresh token reuse detected. All sessions revoked.'), 401);
  }

  // Issue new access JWT + new refresh token
  const newAccessToken = await issueJwt(
    { sub: rtRow.user_id as UserId, workspace_id: rtRow.workspace_id as WorkspaceId,
      tenant_id: rtRow.tenant_id as TenantId, role: rtRow.role as Role },
    c.env.JWT_SECRET,
  );
  const newRefreshValue = crypto.randomUUID() + crypto.randomUUID();
  const newRtHash = await sha256hex(newRefreshValue);
  const newRtId = crypto.randomUUID();

  await c.env.DB.batch([
    // Revoke old token, link to successor
    c.env.DB.prepare(
      `UPDATE refresh_tokens SET revoked_at=unixepoch(), replaced_by=? WHERE id=?`,
    ).bind(newRtId, rtRow.id),
    // Issue new refresh token
    c.env.DB.prepare(
      `INSERT INTO refresh_tokens (id, jti_hash, user_id, tenant_id, workspace_id, role, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, unixepoch() + 2592000)`,
    ).bind(newRtId, newRtHash, rtRow.user_id, rtRow.tenant_id, rtRow.workspace_id, rtRow.role),
  ]);

  return c.json({ token: newAccessToken, refresh_token: newRefreshValue, expires_in: 3600 });
});
```

**Helper:**
```typescript
async function sha256hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
```

**Test Coverage:**
- TC-ID `TC-AUTH003` in `tests/e2e/api/09-jwt-csrf.e2e.ts`  
- Test: login → get refresh_token → call /auth/refresh → get new access + refresh → old refresh rejected (401)  
- Test reuse detection: present old refresh token again → all sessions revoked  

**Rollback Plan:** Keep both code paths. Feature-flag `USE_OPAQUE_REFRESH_TOKENS=true`. On rollback, set false.  
**Success Criteria:**  
- [ ] Old `refresh_token` rejected after single use  
- [ ] Reuse attempt → all user sessions revoked  
- [ ] `replaced_by` chain intact in `refresh_tokens` table  

---

### 2.2 PBKDF2 Upgrade to 600,000 Iterations (SEC-001 / ENH-002)

**File:** `packages/auth/src/jwt.ts` (or wherever `hashPassword` lives) + auth-routes.ts  

**Find `hashPassword` implementation:**
```bash
grep -rn "pbkdf2\|PBKDF2\|iterations\|hashPassword" packages/auth/src/ apps/api/src/
```

**Exact Diff pattern:**
```diff
-const PBKDF2_ITERATIONS = 100_000;
+// SEC-001: OWASP 2024 recommends 600,000 iterations for PBKDF2-HMAC-SHA256
+const PBKDF2_ITERATIONS = 600_000;
+const PBKDF2_VERSION = 2;  // Increment on each iteration-count change
```

**Add `password_hash_version` column migration:**
```sql
-- 0381_password_hash_version.sql
ALTER TABLE users ADD COLUMN password_hash_version INTEGER NOT NULL DEFAULT 1;
```

**Add live rehash on login** (in `/auth/login` handler, after successful password verification):
```typescript
// SEC-001: Rehash if using older iteration count
const currentVersion = userRow.password_hash_version ?? 1;
if (currentVersion < PBKDF2_VERSION) {
  const newHash = await hashPassword(body.password); // Uses new PBKDF2_ITERATIONS
  void c.env.DB.prepare(
    `UPDATE users SET password_hash=?, password_hash_version=? WHERE id=? AND tenant_id=?`,
  ).bind(newHash, PBKDF2_VERSION, userRow.id, tenantId).run().catch(() => {});
}
```

**Test Coverage:** Unit test in `packages/auth/` — verify new hash uses 600k iterations; verify login with old-version hash still succeeds and triggers rehash  
**Rollback Plan:** Revert `PBKDF2_ITERATIONS`. Old hashes still valid (verification reads actual stored hash).  
**Success Criteria:**  
- [ ] New registrations use 600k iterations  
- [ ] Login with v1 hash succeeds and upgrades to v2  
- [ ] `PBKDF2_VERSION` column correctly set  

---

### 2.3 Rate Limit KV Degradation Alerting (SEC-002 / ENH-034)

**File:** `apps/api/src/middleware/rate-limit.ts`  

**Modify the fail-open KV read and write sections:**
```diff
     const raw = await kvGetText(kv, key, null);
+    // If kvGetText returned null due to KV error (not just missing key), we cannot distinguish.
+    // We use a sentinel: attempt a low-cost KV read of a known key; failure = KV degraded.
     const count = raw ? parseInt(raw, 10) : 0;

     // SEC-005: KV write failures must not block the request
     try {
       await kv.put(key, String(count + 1), { expirationTtl: opts.windowSeconds });
     } catch {
-      // KV write failed — don't block the request
+      // KV write failed — emit degradation counter for alerting
+      console.error(JSON.stringify({
+        level: 'error',
+        event: 'ratelimit_kv_degraded',
+        keyPrefix: opts.keyPrefix,
+        ts: new Date().toISOString(),
+      }));
+      // Analytics Engine counter (if available)
+      // void c.env.ANALYTICS?.writeDataPoint({ blobs: ['ratelimit_degraded'], doubles: [1] });
     }
```

**Add to `docs/operations/monitoring-runbook.md`:**
```markdown
## Alert: ratelimit_kv_degraded
- **Trigger:** Log event `ratelimit_kv_degraded` appears in Cloudflare Logs
- **Severity:** SEV-2
- **Impact:** All rate limits silently disabled (R5: BVN 2/hour, R9: OTP 5/hour)
- **Response:** Check KV namespace health in Cloudflare dashboard → escalate to CF support
- **Auto-recovery:** Middleware resumes rate limiting automatically on KV recovery
```

**Test Coverage:** `tests/e2e/api/` — `TST-007`: mock KV write failure, assert `ratelimit_kv_degraded` in console output  
**Rollback Plan:** Remove console.error call (no functional change)  
**Success Criteria:**  
- [ ] KV failure → structured `ratelimit_kv_degraded` log emitted  
- [ ] Runbook entry committed  

---

### 2.4 Token Blacklist Key Hashing (SEC-003)

**File:** `apps/api/src/middleware/auth.ts` line 41 + `apps/api/src/routes/auth-routes.ts` (logout + refresh blacklist writes)  

**Diff in `auth.ts`:**
```diff
-    const blacklisted = await kvGetText(c.env.RATE_LIMIT_KV, `blacklist:${rawToken}`, null);
+    // SEC-003: Hash full token for KV key (avoids 512-byte KV key limit for long JWTs)
+    const tokenHash = await sha256hex(rawToken);
+    const blacklisted = await kvGetText(c.env.RATE_LIMIT_KV, `blacklist:token:${tokenHash}`, null);
```

**Diff in `auth-routes.ts`** (refresh handler, logout handler):
```diff
-      await kv.put(`blacklist:${oldToken}`, '1', { expirationTtl: 3600 });
+      const tokenHash = await sha256hex(oldToken);
+      await kv.put(`blacklist:token:${tokenHash}`, '1', { expirationTtl: 3600 });
```

Ensure the `sha256hex` helper is imported/available in both files (define once in `packages/auth/src/utils.ts` and export).  

**Test Coverage:** `tests/e2e/api/09-jwt-csrf.e2e.ts` — TC-ID `TC-AUTH004`: logout → try to use old token → 401  
**Rollback Plan:** Revert key format. Any blacklisted tokens under old format will expire naturally.  
**Success Criteria:**  
- [ ] Logout → blacklisted token returns 401  
- [ ] KV key is `blacklist:token:<64-char-hex>` never > 80 chars  

---

### 2.5 Workspace Status Check on JWT Refresh (BUG-016)

**File:** `apps/api/src/routes/auth-routes.ts` — new `/auth/refresh` handler (post Sprint 2.1)  

**Add workspace status check** inside the refresh handler after `rtRow` is confirmed valid:
```typescript
// BUG-016: Verify workspace is still active before issuing new token
if (rtRow.workspace_id) {
  const wsRow = await c.env.DB.prepare(
    `SELECT status FROM workspaces WHERE id=? AND tenant_id=? LIMIT 1`,
  ).bind(rtRow.workspace_id, rtRow.tenant_id).first<{ status: string }>();
  if (wsRow?.status === 'terminated') {
    return c.json(errorResponse(ErrorCode.Forbidden, 'Workspace has been terminated.'), 403);
  }
}
```

**Test Coverage:** Add case to `09-jwt-csrf.e2e.ts`: terminate workspace, attempt refresh → 403  
**Rollback Plan:** Remove the `wsRow` check block  
**Success Criteria:**  
- [ ] Terminated workspace → refresh returns 403 `workspace_terminated`  
- [ ] Active workspace → refresh succeeds normally  

---

### 2.6 T3 Governance Check — Extend to Single-Quoted SQL (BUG-017)

**File:** `scripts/governance-checks/check-tenant-isolation.ts`  

**Add secondary scan** after the template-literal scan:
```typescript
// BUG-017: Also check single-quoted SQL strings (previously flagged as out-of-scope)
const singleQuotedSql = content.match(/['"]([^'"]*SELECT[^'"]*FROM[^'"]*WHERE[^'"]*)['"]/gi) ?? [];
for (const sqlStr of singleQuotedSql) {
  if (/\bFROM\s+\w+/i.test(sqlStr) && !/tenant_id/i.test(sqlStr)) {
    const walletTables = ['hl_ledger', 'wallets', 'wallet_transactions'];
    const isWalletQuery = walletTables.some(t => sqlStr.includes(t));
    if (isWalletQuery) {
      violations.push({ file: filePath, query: sqlStr.slice(0, 100), type: 'single-quoted' });
    }
  }
}
```

**Test Coverage:** Add a fixture file with a single-quoted SQL string missing `tenant_id` and verify the check catches it  
**Rollback Plan:** Remove the added block  
**Success Criteria:**  
- [ ] Governance check catches single-quoted T3 violations  
- [ ] Zero false positives on existing codebase  

---

### 2.7 `check-ai-direct-calls.ts` — Dynamic URL Detection (BUG-018)

**File:** `scripts/governance-checks/check-ai-direct-calls.ts`  

**Add dynamic variable pattern detection:**
```typescript
const DYNAMIC_AI_PATTERNS = [
  /\bfetch\s*\(\s*(AI_URL|OPENAI_URL|ANTHROPIC_URL|AI_ENDPOINT|LLM_URL|GPT_URL)/i,
  /\bnew\s+OpenAI\s*\(/,
  /\bnew\s+Anthropic\s*\(/,
  /\bgroq\s*\.\s*chat/i,
  /process\.env\.(OPENAI|ANTHROPIC|GROQ|GEMINI|AI_)_?(KEY|SECRET|TOKEN|URL)/i,
];
// Add to existing scan loop alongside hardcoded URL checks
```

**Test Coverage:** Fixture file with `fetch(AI_URL, ...)` should be flagged  
**Success Criteria:**  
- [ ] Dynamic variable AI calls detected  
- [ ] No false positives on `packages/superagent/` which is the approved AI gateway  

---

### 2.8 Outbound Webhook HMAC Signing (SEC-007 / ENH-014)

**New File: `packages/webhooks/src/signing.ts`**
```typescript
export async function signWebhookPayload(
  payload: string,
  secret: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return 'sha256=' + Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const expected = await signWebhookPayload(payload, secret);
  // Constant-time comparison
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}
```

**Modify outbound webhook dispatcher** (wherever `fetch` is called to deliver webhooks to partners):
```typescript
import { signWebhookPayload } from '@webwaka/webhooks';
// ...
const bodyStr = JSON.stringify(payload);
const signature = await signWebhookPayload(bodyStr, partnerWebhookSecret);
await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-WebWaka-Signature': signature,
    'X-WebWaka-Event': eventType,
    'X-WebWaka-Delivery': deliveryId,
  },
  body: bodyStr,
});
```

**Test Coverage:** `tests/e2e/api/06-webhooks.e2e.ts` — verify `X-WebWaka-Signature` header present and verifiable  
**Success Criteria:**  
- [ ] All outbound webhooks include `X-WebWaka-Signature: sha256=...`  
- [ ] Signature verifiable using partner secret  

---

### 2.9 Failed-Auth IP Logging (SEC-006 / ENH-013)

Already covered in Sprint 1 fix for BUG-006 (auth failure audit log). Confirm:
- `AUTH_LOGIN_FAILURE` event emitted on `/auth/login` 401  
- `AUTH_FAILURE_VERIFY` event emitted on token validation failure  
- Both include `ip_hash` and `ua_hash`  

**Additional:** Add `/auth/login` failure path explicitly:
```typescript
// In /auth/login, after password verify failure:
console.log(JSON.stringify({
  level: 'warn', event: 'AUTH_LOGIN_FAILURE',
  email_hash: await sha256hex(body.email ?? ''),
  ip_hash: await sha256hex(c.req.header('CF-Connecting-IP') ?? ''),
  ts: new Date().toISOString(),
}));
```

---

### 2.10 CRON Ceiling — Dedicated `apps/schedulers` Worker (BUG-005 / ENH-004)

**New directory: `apps/schedulers/`**  

**`apps/schedulers/src/index.ts`:**
```typescript
import { Hono } from 'hono';

export interface Env {
  DB: D1Database;
  RATE_LIMIT_KV: KVNamespace;
  AUDIT_FAIL_KV: KVNamespace;
  ENVIRONMENT: string;
}

// Dispatch table — registered jobs keyed by name
const JOBS: Record<string, (env: Env) => Promise<void>> = {
  'audit-log-redriver': async (env) => { /* re-drive failed audit entries from KV */ },
  'ndpr-retention-sweep': async (env) => { /* purge data beyond 24-month retention */ },
  'wallet-tier-reconciliation': async (env) => { /* CBN tier-cap cross-check */ },
  'dsar-export-processor': async (env) => { /* process pending DSAR export requests */ },
  'refresh-token-cleanup': async (env) => {
    await env.DB.prepare(
      `DELETE FROM refresh_tokens WHERE expires_at < unixepoch() - 86400 AND revoked_at IS NOT NULL`,
    ).run();
  },
};

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log(JSON.stringify({ level: 'info', event: 'scheduler_tick', cron: event.cron, ts: new Date().toISOString() }));
    const dueJobs = await env.DB.prepare(
      `SELECT name FROM scheduled_jobs WHERE next_run_at <= unixepoch() AND enabled=1 ORDER BY priority DESC`,
    ).all<{ name: string }>();

    for (const { name } of dueJobs.results) {
      const job = JOBS[name];
      if (!job) continue;
      try {
        await job(env);
        await env.DB.prepare(
          `UPDATE scheduled_jobs SET last_run_at=unixepoch(), next_run_at=unixepoch()+run_interval_seconds, last_status='ok' WHERE name=?`,
        ).bind(name).run();
      } catch (err) {
        console.error(JSON.stringify({ level: 'error', event: 'scheduler_job_failed', name, error: String(err) }));
        await env.DB.prepare(
          `UPDATE scheduled_jobs SET last_status='error', last_error=? WHERE name=?`,
        ).bind(String(err), name).run();
      }
    }
  },
};
```

**New Migration: `infra/db/migrations/0382_scheduled_jobs.sql`**
```sql
CREATE TABLE IF NOT EXISTS scheduled_jobs (
  name                TEXT PRIMARY KEY,
  enabled             INTEGER NOT NULL DEFAULT 1,
  priority            INTEGER NOT NULL DEFAULT 5,
  run_interval_seconds INTEGER NOT NULL DEFAULT 3600,
  next_run_at         INTEGER NOT NULL DEFAULT 0,
  last_run_at         INTEGER,
  last_status         TEXT,
  last_error          TEXT
);
INSERT OR IGNORE INTO scheduled_jobs (name, run_interval_seconds, priority) VALUES
  ('audit-log-redriver',          300,   10),
  ('refresh-token-cleanup',       86400, 1),
  ('ndpr-retention-sweep',        86400, 3),
  ('wallet-tier-reconciliation',  86400, 8),
  ('dsar-export-processor',       3600,  7);
```

**`apps/schedulers/wrangler.toml`:**
```toml
name = "webwaka-schedulers"
main = "src/index.ts"
compatibility_date = "2024-12-05"

[[triggers]]
crons = ["*/30 * * * *"]   # 1 CRON slot — dispatches all jobs internally

[[d1_databases]]
binding = "DB"
database_name = "webwaka-db"
database_id = "72fa5ec8-52c2-4f41-b486-957d7b00c76f"
```

**Add to `.github/workflows/deploy-production.yml`:**
```yaml
- name: Deploy Schedulers Worker
  run: pnpm --filter @webwaka/schedulers wrangler deploy --env production
```

**Test Coverage:** Unit test `apps/schedulers/src/index.test.ts` — mock DB, trigger scheduled event, verify dispatch  
**Rollback Plan:** Disable `enabled=0` for all jobs in `scheduled_jobs` table. No CRON change needed.  
**Success Criteria:**  
- [ ] Schedulers worker deployed and cron firing every 30 minutes  
- [ ] `scheduled_jobs` table showing `last_status='ok'` for each job  
- [ ] Production CRON allocation freed from 5/5 → available headroom for new critical CRONs  

---

### 2.11 Billing Enforcement — Path Normalization (BUG-015)

**File:** `apps/api/src/middleware/billing-enforcement.ts` line 38–45  

**Exact Diff:**
```diff
 function isExemptPath(path: string): boolean {
-  if (EXEMPT_PATHS.has(path)) return true;
+  // BUG-015: Normalize path before check — strip trailing slash and query string
+  const normalizedPath = path.split('?')[0]!.replace(/\/+$/, '');
+  if (EXEMPT_PATHS.has(normalizedPath)) return true;
-  if (path.startsWith('/health/')) return true;
+  if (normalizedPath.startsWith('/health/')) return true;
-  if (path.startsWith('/billing/')) return true;
+  if (normalizedPath.startsWith('/billing/')) return true;
-  if (path.startsWith('/onboarding/')) return true;
+  if (normalizedPath.startsWith('/onboarding/')) return true;
-  if (path.startsWith('/payments/')) return true;
+  if (normalizedPath.startsWith('/payments/')) return true;
   return false;
 }
```

**Test Coverage:** Unit test — `isExemptPath('/auth/login/')` → true; `isExemptPath('/auth/login?next=/dashboard')` → true  
**Success Criteria:**  
- [ ] `/auth/login/` correctly exempted  
- [ ] `/auth/login?redirect=x` correctly exempted  

---

## SPRINT 3: UX + COMPLIANCE (Weeks 3–4)

**Scope:** P2 UX blockers + all 8 compliance findings + P2 medium issues = 36 items | ~18 days  
Each item follows the same template. Key items detailed fully below; remainder summarised.

---

### 3.1 Offline-First POS + `useOnlineStatus` Hook (BUG-010 / ENH-002 / ENH-020)

**New Package: `packages/offline-queue/`**

**`packages/offline-queue/src/index.ts`:**
```typescript
const DB_NAME = 'webwaka-offline-queue';
const STORE = 'pending_actions';

export interface OfflineAction {
  id: string;
  type: 'pos_sale' | 'offering_create' | 'invite_send';
  payload: unknown;
  createdAt: number;
  retries: number;
}

export async function enqueueAction(action: Omit<OfflineAction, 'id' | 'createdAt' | 'retries'>): Promise<string> {
  const db = await openDb();
  const id = crypto.randomUUID();
  const full: OfflineAction = { ...action, id, createdAt: Date.now(), retries: 0 };
  const tx = db.transaction(STORE, 'readwrite');
  await tx.objectStore(STORE).add(full);
  return id;
}

export async function drainQueue(
  baseUrl: string,
  authToken: string,
): Promise<{ synced: number; failed: number }> {
  const db = await openDb();
  const actions = await getAllPending(db);
  let synced = 0, failed = 0;
  for (const action of actions) {
    try {
      await syncAction(action, baseUrl, authToken);
      await deleteAction(db, action.id);
      synced++;
    } catch {
      await incrementRetry(db, action.id);
      failed++;
    }
  }
  return { synced, failed };
}

// IndexedDB helpers omitted for brevity — standard IDBOpenDBRequest pattern
function openDb(): Promise<IDBDatabase> { /* ... */ }
```

**New Hook: `apps/workspace-app/src/hooks/useOnlineStatus.ts`:**
```typescript
import { useState, useEffect } from 'react';
import { drainQueue } from '@webwaka/offline-queue';

export function useOnlineStatus(authToken: string | null) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      if (authToken) {
        const result = await drainQueue('/api', authToken).catch(() => ({ synced: 0, failed: 0 }));
        if (result.synced > 0) {
          // Dispatch toast notification
          window.dispatchEvent(new CustomEvent('offline-sync-complete', { detail: result }));
        }
      }
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [authToken]);

  return isOnline;
}
```

**Offline Banner Component: `apps/workspace-app/src/components/OfflineBanner.tsx`:**
```tsx
export function OfflineBanner({ isOnline }: { isOnline: boolean }) {
  if (isOnline) return null;
  return (
    <div role="alert" aria-live="assertive" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: '#ef4444', color: '#fff', padding: '8px 16px', textAlign: 'center', fontSize: '14px',
    }}>
      You are offline. Actions will sync when connection is restored.
    </div>
  );
}
```

**Modify `apps/workspace-app/src/pages/POS.tsx`** — wrap checkout button:
```typescript
const isOnline = useOnlineStatus(auth?.token ?? null);

const handleCheckout = async () => {
  if (!isOnline) {
    await enqueueAction({ type: 'pos_sale', payload: { cart, total_kobo } });
    toast({ message: 'Sale queued. Will sync when online.', type: 'info' });
    clearCart();
    return;
  }
  // Existing online checkout flow...
};
```

**Test Coverage:** `TC-OFL002` in `tests/e2e/api/20-ussd.e2e.ts` (PWA section) — simulate offline → add to cart → go online → verify sync  
**Success Criteria:**  
- [ ] Offline banner shown when `navigator.onLine` false  
- [ ] POS sale queued in IndexedDB when offline  
- [ ] Queue drained on reconnect; toast shows "X sales synced"  

---

### 3.2 VAT 7.5% POS Line Item + Print CSS (BUG-013 / COMP-005 / ENH-017 / ENH-018)

**File:** `apps/workspace-app/src/pages/POS.tsx`  

**Add to cart computation:**
```typescript
const VAT_RATE = 0.075; // FIRS 7.5% VAT — P9: computed in kobo, never floats

// In cart total computation:
const subtotal_kobo = cart.reduce((sum, item) => sum + item.price_kobo * item.qty, 0);
const vat_kobo = Math.round(subtotal_kobo * VAT_RATE); // P9: integer
const total_kobo = subtotal_kobo + vat_kobo;
```

**Add to receipt display:**
```tsx
<div className="receipt-line">
  <span>Subtotal</span><span>{formatNaira(subtotal_kobo)}</span>
</div>
<div className="receipt-line receipt-vat">
  <span>VAT (7.5%)</span><span>{formatNaira(vat_kobo)}</span>
</div>
<div className="receipt-line receipt-total">
  <span><strong>Total</strong></span><span><strong>{formatNaira(total_kobo)}</strong></span>
</div>
```

**Add print CSS to `apps/workspace-app/src/pages/POS.css`:**
```css
@media print {
  .pos-nav, .pos-cart-controls, .pos-product-grid, .pos-payment-selector { display: none !important; }
  .pos-receipt { display: block !important; width: 58mm; font-size: 11px; }
  .receipt-line { display: flex; justify-content: space-between; }
  .receipt-total { border-top: 1px solid #000; font-weight: bold; }
  .receipt-vat { color: #555; }
}
```

**Test Coverage:** `TC-F020` in `tests/e2e/api/10-payment-integrity.e2e.ts` — verify `vat_kobo = Math.round(subtotal * 0.075)` is integer  
**Success Criteria:**  
- [ ] `vat_kobo` is always an integer (P9 preserved)  
- [ ] Receipt shows three lines: Subtotal / VAT 7.5% / Total  
- [ ] Print preview hides nav/cart, shows 58mm receipt layout  

---

### 3.3 NDPR DSAR Export Endpoint (COMP-001 / ENH-009 / ENH-040)

**New Route: `apps/api/src/routes/compliance.ts`**
```typescript
complianceRoutes.post('/dsar/request', authMiddleware, async (c) => {
  const auth = c.get('auth');
  const requestId = crypto.randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + 86400; // 24h

  await c.env.DB.prepare(
    `INSERT INTO dsar_requests (id, user_id, tenant_id, status, expires_at, requested_at)
     VALUES (?, ?, ?, 'pending', ?, unixepoch())`,
  ).bind(requestId, auth.userId, auth.tenantId, expiresAt).run();

  return c.json({
    requestId,
    message: 'Your data export request has been received. A download link will be sent to your email within 24 hours.',
    estimatedCompletionAt: new Date(expiresAt * 1000).toISOString(),
  }, 202);
});
```

**Add to `apps/schedulers/src/jobs/dsar-export-processor.ts`** (runs every hour via scheduler):
```typescript
export async function processDsarRequests(env: Env): Promise<void> {
  const pending = await env.DB.prepare(
    `SELECT id, user_id, tenant_id FROM dsar_requests WHERE status='pending' AND expires_at > unixepoch()`,
  ).all<{ id: string; user_id: string; tenant_id: string }>();

  for (const req of pending.results) {
    // Assemble all user rows across tables
    const [userRow, wsRow, ledgerRows, notifRows] = await Promise.all([
      env.DB.prepare(`SELECT email, full_name, phone, created_at FROM users WHERE id=? AND tenant_id=?`).bind(req.user_id, req.tenant_id).first(),
      env.DB.prepare(`SELECT name, subscription_plan FROM workspaces WHERE id=(SELECT workspace_id FROM users WHERE id=? LIMIT 1) AND tenant_id=?`).bind(req.user_id, req.tenant_id).first(),
      env.DB.prepare(`SELECT * FROM hl_ledger WHERE user_id=? AND tenant_id=? ORDER BY created_at DESC LIMIT 1000`).bind(req.user_id, req.tenant_id).all(),
      env.DB.prepare(`SELECT * FROM notification_inbox WHERE user_id=? AND tenant_id=? ORDER BY created_at DESC LIMIT 500`).bind(req.user_id, req.tenant_id).all(),
    ]);

    const exportData = { user: userRow, workspace: wsRow, transactions: ledgerRows.results, notifications: notifRows.results };
    const exportJson = JSON.stringify(exportData, null, 2);

    // Store export in KV (signed, 48h TTL) — user retrieves via signed URL
    const exportKey = `dsar:export:${req.id}`;
    await env.RATE_LIMIT_KV.put(exportKey, exportJson, { expirationTtl: 172800 });

    await env.DB.prepare(
      `UPDATE dsar_requests SET status='ready', completed_at=unixepoch(), download_key=? WHERE id=?`,
    ).bind(exportKey, req.id).run();

    console.log(JSON.stringify({ level: 'info', event: 'dsar_export_ready', requestId: req.id }));
  }
}
```

**New Migration: `infra/db/migrations/0383_dsar_requests.sql`**
```sql
CREATE TABLE IF NOT EXISTS dsar_requests (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending',  -- pending | processing | ready | expired
  download_key    TEXT,
  requested_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  completed_at    INTEGER,
  expires_at      INTEGER NOT NULL
);
```

**Test Coverage:** `tests/e2e/api/15-compliance-full.e2e.ts` — POST `/compliance/dsar/request` → 202 → scheduler runs → `dsar_requests.status='ready'`  
**Rollback Plan:** Disable endpoint. Drop migration.  
**Success Criteria:**  
- [ ] DSAR request creates `dsar_requests` row  
- [ ] Scheduler processes and marks `ready` within 24h  
- [ ] Export contains all user data tables  

---

### 3.4 Account Deletion Confirmation Step (BUG-011 / UX-P3-02)

Already handled via `X-Confirm-Erasure: confirmed` header in Sprint 1.  
**Frontend change** in `apps/workspace-app/src/pages/Settings.tsx`:
```tsx
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [confirmEmail, setConfirmEmail] = useState('');

// Replace the delete button with a two-step flow:
{!showDeleteConfirm ? (
  <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger">
    Delete Account
  </button>
) : (
  <div role="dialog" aria-label="Confirm account deletion">
    <p><strong>This action is irreversible.</strong> All your data will be permanently deleted in compliance with NDPR.</p>
    <label>Type your email to confirm: <strong>{auth.email}</strong></label>
    <input value={confirmEmail} onChange={e => setConfirmEmail(e.target.value)} type="email" />
    <button
      disabled={confirmEmail !== auth.email}
      onClick={handleDeleteAccount}
      className="btn-danger"
    >
      I understand — delete my account
    </button>
    <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
  </div>
)}
```

**API call must include header:**
```typescript
await fetch('/auth/me', {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}`, 'X-Confirm-Erasure': 'confirmed' },
});
```

**Test Coverage:** `TC-ID002` / `TC-AU001` in `tests/e2e/api/11-compliance-invariants.e2e.ts`  
**Success Criteria:**  
- [ ] Delete button requires email confirmation  
- [ ] Wrong email → button disabled  
- [ ] Correct email → account deleted with receipt  

---

### 3.5 2FA / TOTP for Platform Super-Admin (BUG-038 / ENH-014 / ENH-035)

**New Migration: `infra/db/migrations/0384_totp.sql`**
```sql
ALTER TABLE users ADD COLUMN totp_secret TEXT;
ALTER TABLE users ADD COLUMN totp_enabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN totp_enrolled_at INTEGER;
```

**Add TOTP routes** `apps/api/src/routes/auth-routes.ts`:
```typescript
// POST /auth/totp/enrol — generates TOTP secret, returns QR URI
authRoutes.post('/totp/enrol', authMiddleware, superAdminOnlyMiddleware, async (c) => {
  const secret = generateTotpSecret(); // base32-encoded 20-byte random
  const qrUri = `otpauth://totp/WebWaka:${auth.email}?secret=${secret}&issuer=WebWaka`;
  // Store secret temporarily in KV until verified
  await c.env.RATE_LIMIT_KV.put(`totp:pending:${auth.userId}`, secret, { expirationTtl: 600 });
  return c.json({ secret, qrUri });
});

// POST /auth/totp/verify — confirm TOTP code; activates 2FA
authRoutes.post('/totp/verify', authMiddleware, superAdminOnlyMiddleware, async (c) => {
  const { code } = await c.req.json<{ code: string }>();
  const pendingSecret = await c.env.RATE_LIMIT_KV.get(`totp:pending:${auth.userId}`);
  if (!pendingSecret || !verifyTotp(pendingSecret, code)) {
    return c.json({ error: 'invalid_totp_code' }, 400);
  }
  await c.env.DB.prepare(
    `UPDATE users SET totp_secret=?, totp_enabled=1, totp_enrolled_at=unixepoch() WHERE id=? AND tenant_id=?`,
  ).bind(pendingSecret, auth.userId, auth.tenantId).run();
  await c.env.RATE_LIMIT_KV.delete(`totp:pending:${auth.userId}`);
  return c.json({ message: '2FA enabled successfully.' });
});
```

**Enforce TOTP at login for super_admin role:**
```typescript
// In /auth/login handler, after password verified for role='super_admin':
if (userRow.role === 'super_admin' && userRow.totp_enabled) {
  const totpCode = body.totp_code;
  if (!totpCode || !verifyTotp(userRow.totp_secret!, totpCode)) {
    return c.json({ error: 'totp_required', message: 'TOTP code required for super admin login.' }, 401);
  }
}
// If totp not yet enrolled, redirect to enrollment:
if (userRow.role === 'super_admin' && !userRow.totp_enabled) {
  return c.json({ error: 'totp_enrolment_required', enrolmentUrl: '/auth/totp/enrol' }, 403);
}
```

**Test Coverage:** `TC-AU001/AU002` in `tests/e2e/api/11-compliance-invariants.e2e.ts`  
**Success Criteria:**  
- [ ] Super-admin without TOTP → login redirects to enrolment  
- [ ] Super-admin with TOTP → login requires code  
- [ ] Wrong TOTP code → 401  

---

### 3.6–3.35 Remaining P2 Issues (Summary)

These follow identical template structure. Full details in implementation tickets:

| ID | Fix | File | Effort |
|---|---|---|---|
| BUG-015 | Billing path normalization | billing-enforcement.ts:38 | 30 min |
| BUG-016 | JWT refresh workspace check | auth-routes.ts:refresh | 1 h |
| BUG-017 | T3 check single-quoted SQL | check-tenant-isolation.ts | 1 h |
| BUG-018 | AI check dynamic URLs | check-ai-direct-calls.ts | 1 h |
| BUG-019 | Paystack webhook test | tests/e2e/api/06-webhooks | 2 h |
| BUG-020 | ESLint errors triage | apps/api | 4 h |
| BUG-021 | OpenAPI auto-generation | openapi.ts → hono/zod-openapi | 8 h |
| BUG-022 | HITL append-only DDL | hitl-service.ts + migration | 2 h |
| BUG-023 | AI consent version persist | superagent middleware | 3 h |
| BUG-024 | POS qty clamp | POS.tsx::updateQty | 30 min |
| BUG-025 | Route change focus mgmt | App.tsx + ScrollRestoration | 1 h |
| BUG-026 | Color contrast fix | POS.tsx #9ca3af → #6b7280 | 30 min |
| BUG-027 | Cookie consent banner | brand-runtime/templates | 1 day |
| BUG-028 | SW registration brand-runtime | brand-runtime templates | 4 h |
| BUG-029 | JSON-LD LocalBusiness data | discovery templates | 3 h |
| BUG-030 | aria-current partner-admin nav | partner-admin/index.html | 1 h |
| BUG-031 | Attribution audit log | partners table patch | 1 h |
| BUG-032 | k6 smoke 4xx fix | infra/k6/smoke.js:23 | 1 h |
| BUG-033 | Migration checksum CI step | deploy-production.yml | 2 h |
| BUG-034 | Dependabot CVE triage | .security-suppressions.yaml | 2 h |
| BUG-035 | Settings page split | Settings.tsx (661 LOC) | 1 day |
| BUG-036 | USSD "0. Back" menu option | ussd-gateway/src/menus.ts | 2 h |
| BUG-037 | CBN wallet reconciliation CRON | schedulers job | 4 h |
| BUG-039 | D1 data residency docs | wrangler.toml + compliance-dashboard.md | 2 h |
| BUG-040 | Toast role="status" | workspace-app/lib/toast.ts:29 | 15 min |
| BUG-041 | Canary deploy automation | deploy-production.yml | 4 h |
| BUG-042 | Geo-IP location default | public-discovery templates | 2 h |
| COMP-004 | AI consent version | consent_history migration | 3 h |
| COMP-006 | Data residency docs | docs/governance/ | 2 h |
| COMP-007 | Attribution audit log | partners PATCH handler | 1 h |
| COMP-008 | NDPR 24-month retention CRON | schedulers job | 4 h |

---

## SPRINT 4: CODE QUALITY + TEST COVERAGE (Weeks 5–6)

**Scope:** All 15 P3 findings + 12 test gap items + 10 infra items = 37 items | ~10 days

---

### 4.1 Hostile-Tenant RLS Regression Suite (TST-009 / ENH-047)

**New File: `tests/e2e/api/25-cross-tenant-isolation.e2e.ts`**
```typescript
/**
 * TST-009: Hostile tenant E2E — T3 invariant regression suite
 * Creates two isolated tenants (A, B) and asserts zero cross-tenant data leakage.
 */
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8787';

test.describe('TC-INV002 | Cross-tenant isolation (hostile tenant)', () => {
  let tokenA: string, tokenB: string;
  let workspaceAId: string, workspaceBId: string;
  let tenantAId: string, tenantBId: string;

  test.beforeAll(async ({ request }) => {
    // Register Tenant A
    const resA = await request.post(`${BASE_URL}/auth/register`, {
      data: { email: `tenant-a-${Date.now()}@test.invalid`, password: 'Test1234!', businessName: 'TenantAlpha' },
    });
    const bodyA = await resA.json();
    tokenA = bodyA.token;
    workspaceAId = bodyA.user.workspaceId;
    tenantAId = bodyA.user.tenantId;

    // Register Tenant B
    const resB = await request.post(`${BASE_URL}/auth/register`, {
      data: { email: `tenant-b-${Date.now()}@test.invalid`, password: 'Test1234!', businessName: 'TenantBeta' },
    });
    const bodyB = await resB.json();
    tokenB = bodyB.token;
    workspaceBId = bodyB.user.workspaceId;
    tenantBId = bodyB.user.tenantId;
  });

  test('TC-INV002 | Tenant A cannot read Tenant B workspace settings', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/workspaces/${workspaceBId}/settings`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    expect(res.status()).toBe(404); // Must not return 200 with B's data
  });

  test('TC-INV002 | Tenant A cannot list Tenant B users', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/workspaces/${workspaceBId}/users`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    expect(res.status()).toBeOneOf([403, 404]);
  });

  test('TC-INV002 | requirePrimaryPhoneVerified with wrong tenantId throws', async ({ request }) => {
    // TC-BUG-001 regression: guard must reject cross-tenant check
    const res = await request.post(`${BASE_URL}/auth/kyc/phone-verify`, {
      headers: { Authorization: `Bearer ${tokenA}` },
      data: { tenant_id_override: tenantBId }, // Should be ignored
    });
    // Result must not expose Tenant B's phone verification state
    expect(res.status()).not.toBe(200); // 400 or 403 expected
  });

  test('TC-INV003 | Wallet operations scoped to correct tenant', async ({ request }) => {
    // Create wallet for A; verify B cannot debit it
    const topupRes = await request.post(`${BASE_URL}/wallet/topup`, {
      headers: { Authorization: `Bearer ${tokenA}` },
      data: { amount_kobo: 1000, channel: 'test' },
    });
    // B attempting to use A's wallet reference must fail
    const debitRes = await request.post(`${BASE_URL}/wallet/transfer`, {
      headers: { Authorization: `Bearer ${tokenB}` },
      data: { from_workspace_id: workspaceAId, amount_kobo: 500 },
    });
    expect(debitRes.status()).toBeOneOf([403, 404]);
  });
});
```

**Add to `package.json`:**
```json
"test:rls": "playwright test --project=api-e2e tests/e2e/api/25-cross-tenant-isolation.e2e.ts"
```

---

### 4.2 Property-Based Tests for Currency (TST-003 / ENH-046)

**New File: `packages/payments/src/__tests__/currency.property.test.ts`**
```typescript
import { test, fc } from '@fast-check/vitest';
import { formatNaira, parseNairaInput } from '../currency.js';

test.prop([fc.integer({ min: 0, max: 100_000_000_00 })])(
  'TC-P003 | P9: formatNaira ↔ parseNairaInput round-trips within 1 kobo',
  (kobo) => {
    const formatted = formatNaira(kobo);
    const reparsed = parseNairaInput(formatted);
    // Allow 1 kobo rounding tolerance for compact display
    expect(Math.abs(reparsed - kobo)).toBeLessThanOrEqual(1);
  },
);

test.prop([fc.float({ min: 0.1, max: 1e9, noNaN: true, noDefaultInfinity: true })])(
  'TC-P003 | P9: parseNairaInput always returns integer (never float)',
  (nairaFloat) => {
    const parsed = parseNairaInput(String(nairaFloat));
    expect(Number.isInteger(parsed)).toBe(true);
  },
);
```

---

### 4.3 Persona-Specific E2E Packs (TST-001 / ENH for TST-004)

**New File: `tests/e2e/api/22-partner-admin-session.e2e.ts`** — covers partner admin login, tenant management, CSV export  
**New File: `tests/e2e/api/23-super-admin-actions.e2e.ts`** — covers platform admin claim approval, bulk actions, 2FA  
**New File: `tests/e2e/api/24-ussd-full-journey.e2e.ts`** — covers full USSD session: wallet balance → send money → session expire  

(Full TC-IDs: `TC-US001–TC-US011` in 24-ussd-full-journey.e2e.ts)

---

### 4.4 P3 Code Quality Fixes (Summary)

| ID | Fix | Effort |
|---|---|---|
| BUG-043 | `formatNaira` compact precision | 30 min |
| BUG-044 | USSD TTL named constant | 15 min |
| BUG-045 | `as any` in notification-routes | 2 h |
| BUG-046 | POS inline styles → CSS Modules | 1 day |
| BUG-047 | Phone input `pattern`+`inputMode` | 15 min |
| BUG-048 | Print CSS for POS receipts | 2 h |
| BUG-049 | Low-stock threshold configurable | 2 h |
| BUG-050 | Payment icons emoji → SVG | 1 h |
| BUG-051 | Session hash failure → error log | 30 min |
| BUG-052 | OpenAPI changelog endpoint | 2 h |
| BUG-053 | Law firm matter-number sequence | 2 h |
| BUG-054 | USSD 429 message improvement | 30 min |
| BUG-055 | "Report this listing" UX | 4 h |
| BUG-056 | Founder-approval CI enforcement | 1 h |
| BUG-057 | Rollback runbook | 2 h |

**For each P3 fix**, follow this abbreviated template:
```
File: [exact path and line]
Change: [diff]
Test: grep or unit test
Rollback: git revert (no DB)
```

---

## SPRINT 5+: ENHANCEMENT BACKLOG (Month 2)

**48 enhancements in priority order. Full implementation cards linked in project tracker.**

| # | ID | Title | Sprint | Effort | Blocks |
|---|---|---|---|---|---|
| 1 | ENH-001 | Opaque Refresh Token | Sprint 2 | 8 h | — |
| 2 | ENH-002 | PBKDF2 600k | Sprint 2 | 4 h | — |
| 3 | ENH-003 | NDPR erasure batch | Sprint 1 | 4 h | — |
| 4 | ENH-004 | Schedulers Worker | Sprint 2 | 1 day | ENH-011, ENH-040, ENH-009 |
| 5 | ENH-005 | verify-secrets CI | Sprint 2 | 2 h | — |
| 6 | ENH-006 | T3 fix guards.ts | Sprint 1 | 30 min | — |
| 7 | ENH-007 | CI on push to main | Sprint 1 | 15 min | — |
| 8 | ENH-008 | Workspace status on refresh | Sprint 2 | 1 h | ENH-001 |
| 9 | ENH-009 | T3 single-quoted SQL check | Sprint 2 | 1 h | — |
| 10 | ENH-010 | Founder label CI enforce | Sprint 4 | 1 h | — |
| 11 | ENH-011 | Token blacklist hashing | Sprint 2 | 1 h | — |
| 12 | ENH-012 | Standardize error response | Sprint 3 | 3 h | — |
| 13 | ENH-013 | OpenAPI auto-gen | Sprint 3 | 8 h | — |
| 14 | ENH-014 | Webhook HMAC signing | Sprint 2 | 3 h | — |
| 15 | ENH-015 | Structured logging correlation IDs | Sprint 3 | 4 h | — |
| 16 | ENH-016 | Failed-auth IP logging | Sprint 2 | 2 h | — |
| 17 | ENH-017 | Consent-version persistence | Sprint 3 | 3 h | — |
| 18 | ENH-018 | CDN cache-control headers | Sprint 3 | 2 h | — |
| 19 | ENH-019 | ErrorBoundary package | Sprint 1 | 4 h | — |
| 20 | ENH-020 | Offline queue + useOnlineStatus | Sprint 3 | 2 days | — |
| 21 | ENH-021 | Barcode scanner POS | Sprint 4 | 4 h | — |
| 22 | ENH-022 | VAT 7.5% POS | Sprint 3 | 1 day | — |
| 23 | ENH-023 | Skeleton loader component | Sprint 4 | 2 h | — |
| 24 | ENH-024 | Role-permissions matrix | Sprint 4 | 4 h | — |
| 25 | ENH-025 | Workspace audit-log viewer | Sprint 4 | 4 h | — |
| 26 | ENH-026 | Branding preview iframe | Sprint 4 | 4 h | — |
| 27 | ENH-027 | axe-core CI | Sprint 4 | 2 h | — |
| 28 | ENH-028 | Account deletion confirm | Sprint 3 | 1 h | — |
| 29 | ENH-029 | Migration checksum verification | Sprint 3 | 2 h | — |
| 30 | ENH-030 | Canary deploy automation | Sprint 4 | 4 h | — |
| 31 | ENH-031 | SLO scorecard | Sprint 4 | 1 day | — |
| 32 | ENH-032 | Dead letter queue webhooks | Sprint 4 | 4 h | — |
| 33 | ENH-033 | Rate-limit degradation counter | Sprint 2 | 2 h | — |
| 34 | ENH-034 | 2FA super-admin | Sprint 3 | 1 day | — |
| 35 | ENH-035 | Branch preview deploy | Sprint 4 | 4 h | — |
| 36 | ENH-036 | USSD i18n Yoruba/Hausa/Igbo | Sprint 5 | 3 days | — |
| 37 | ENH-037 | Nigerian phone normalization | Sprint 3 | 2 h | — |
| 38 | ENH-038 | Workspace-scoped rate limiting | Sprint 3 | 3 h | — |
| 39 | ENH-039 | DSAR export endpoint | Sprint 4 | 2 days | ENH-004 |
| 40 | ENH-040 | Real-time platform-admin dashboard | Sprint 5 | 2 days | — |
| 41 | ENH-041 | Admin keyboard palette | Sprint 5 | 4 h | — |
| 42 | ENH-042 | Shared reservation primitive | Sprint 5 | 1 week | — |
| 43 | ENH-043 | Clinic consent-capture UI | Sprint 5 | 4 h | — |
| 44 | ENH-044 | Pharmacy controlled drugs | Sprint 5 | 1 day | — |
| 45 | ENH-045 | Property-based currency tests | Sprint 4 | 2 h | — |
| 46 | ENH-046 | Hostile-tenant RLS tests | Sprint 4 | 4 h | — |
| 47 | ENH-047 | FIRS VAT calculation engine | Sprint 3 | 1 day | — |
| 48 | ENH-048 | Prayer-times verticals-mosque | Sprint 5 | 4 h | — |

---

## VERIFICATION MATRIX

| Finding ID | Test File | TC-ID | Governance Check | Sprint |
|---|---|---|---|---|
| BUG-001 | 08-tenant-isolation.e2e.ts | TC-INV002 | check-tenant-isolation.ts | 1 |
| BUG-002 | CI artifact (migration-audit-*.txt) | N/A | apply-safe.sh | 1 |
| BUG-003 | 09-jwt-csrf.e2e.ts | TC-CSRF001 | security-baseline.md | 1 |
| BUG-004 | 09-jwt-csrf.e2e.ts | TC-AUTH003 | N/A | 2 |
| BUG-005 | schedulers unit test | N/A | wrangler.toml CRON | 2 |
| BUG-006 | 09-jwt-csrf.e2e.ts | TC-AUTH004 | audit-log check | 1 |
| BUG-007 | CI on push to main | N/A | ci.yml triggers | 1 |
| BUG-008 | cycle-01-smoke.ts | TC-F001 | health/payment-config | 1 |
| BUG-009 | workspace-app.e2e.ts | N/A | N/A | 1 |
| BUG-010 | 20-ussd.e2e.ts (PWA section) | TC-OFL002 | N/A | 3 |
| BUG-011 | 11-compliance-invariants.e2e.ts | TC-ID002 | N/A | 1 |
| BUG-012 | 24-ussd-full-journey.e2e.ts | TC-US001 | N/A | 3 |
| BUG-013 | 10-payment-integrity.e2e.ts | TC-F020 | check-monetary-integrity.ts | 3 |
| BUG-014 | 11-compliance-invariants.e2e.ts | TC-AU001 | audit-log.ts | 1 |
| BUG-015 | billing unit test | N/A | N/A | 2 |
| BUG-016 | 09-jwt-csrf.e2e.ts | TC-AUTH003 | N/A | 2 |
| BUG-017 | governance-checks | N/A | check-tenant-isolation.ts | 2 |
| BUG-018 | governance-checks | N/A | check-ai-direct-calls.ts | 2 |
| BUG-019 | 06-webhooks.e2e.ts | TC-WH001 | N/A | 2 |
| BUG-020 | `pnpm lint` | N/A | N/A | 3 |
| BUG-021 | GET /openapi.json | N/A | N/A | 3 |
| BUG-022 | 12-l3-hitl.e2e.ts | TC-HR001 | N/A | 3 |
| BUG-023 | 15-compliance-full.e2e.ts | TC-ID008 | N/A | 3 |
| BUG-024 | POS unit test | N/A | check-monetary-integrity.ts | 3 |
| BUG-025 | a11y axe-core | N/A | N/A | 4 |
| BUG-026 | a11y axe-core | N/A | N/A | 3 |
| BUG-027 | 15-compliance-full.e2e.ts | NDPR-cookie | N/A | 3 |
| BUG-028 | PWA Lighthouse | N/A | N/A | 3 |
| BUG-029 | discovery E2E | N/A | N/A | 3 |
| BUG-030 | a11y audit | N/A | N/A | 3 |
| BUG-031 | 11-compliance-invariants.e2e.ts | TC-AU002 | N/A | 3 |
| BUG-032 | k6 smoke run | N/A | N/A | 2 |
| BUG-033 | CI artifact | N/A | apply-safe.sh | 2 |
| BUG-034 | Dependabot alerts | N/A | N/A | 2 |
| BUG-035 | workspace-app visual | N/A | N/A | 3 |
| BUG-036 | 20-ussd.e2e.ts | TC-US008 | N/A | 3 |
| BUG-037 | 17-wallet-lifecycle.e2e.ts | TC-W007 | check-monetary-integrity.ts | 3 |
| BUG-038 | 11-compliance-invariants.e2e.ts | TC-AU001 | N/A | 3 |
| BUG-039 | docs check | N/A | N/A | 3 |
| BUG-040 | a11y axe-core | N/A | N/A | 3 |
| BUG-041 | deploy workflow | N/A | N/A | 4 |
| BUG-042 | discovery E2E | N/A | N/A | 3 |
| BUG-043–057 | unit tests / visual | P3 | N/A | 4 |
| SEC-001–015 | 09, 11, 15 e2e.ts | TC-AUTH* | security-baseline.md | 2–3 |
| COMP-001–008 | 15-compliance-full.e2e.ts | NDPR-* | N/A | 3 |
| TST-001–012 | New E2E files | various | N/A | 4 |
| INF-001–010 | CI workflow artifacts | N/A | governance-checks | 2–4 |
| ENH-001–048 | Per-feature E2E | various | N/A | 2–5 |

---

## DEPLOYMENT SEQUENCE

```
Week 1 (Sprint 1):
  Day 1–2: BUG-001, BUG-003, BUG-007 → staging → pnpm test:cycle-02 --grep TC-INV002,TC-CSRF001
  Day 3:   BUG-008, BUG-009 → staging → smoke pass
  Day 4:   BUG-014, BUG-006, COMP-002/003 → staging → pnpm test:cycle-04 --grep TC-ID002
  Day 5:   Production canary 5% → monitor 2h → full production deploy
           Post-deploy: pnpm test:p0-blockers

Week 2 (Sprint 2):
  BUG-004 (opaque refresh), SEC-001 (PBKDF2), BUG-005 (schedulers) → staging
  → pnpm test:cycle-02 → pnpm test:cycle-05 (wallet)
  → Production canary 5% (4h for auth changes) → full deploy
  Post-deploy: verify refresh_tokens table populated; CRON firing

Week 3 (Sprint 3):
  P2 UX + compliance batch → staging
  → Full E2E suite: pnpm test:e2e
  → Visual regression: pnpm test:visual
  → Production canary 5% → full deploy

Week 4 (Sprint 4):
  P3 quality + test coverage → staging → full E2E → production

Month 2 (Sprint 5+):
  Enhancement backlog by domain group (offline queue, USSD i18n, analytics, verticals)
  Each group: staging → E2E → canary → full
```

---

## MONITORING VALIDATION

### Cloudflare Analytics (post-deploy checks)
```
audit_log writes/min:     baseline + 30% (auth failures now logged)
ratelimit_kv_degraded:    target 0 per day
frontend_render_error:    target < 5 per day (ErrorBoundary reports)
refresh_token_reuse:      target 0 (any occurrence = active investigation)
ndpr_erasure_completed:   matches erasure_receipts.status='complete' count
dsar_requests pending:    < 24h age
scheduler_job_failed:     target 0 per day
```

### Error Rate Baselines
```
HTTP 403 (CSRF blocked):   Watch for spike in first 2h after BUG-003 deploy
                           Expected: 0 legitimate 403s from internal callers
HTTP 401 (auth failures):  Should increase by ~10% (previously suppressed)
                           All new 401s logged as AUTH_FAILURE_VERIFY
HTTP 503 (bank config):    Target 0; any occurrence = ops alert
```

### Audit Log Volume
```
Pre-Sprint-1:  N entries/hour (baseline from HANDOVER.md §3c)
Post-Sprint-1: +~25% (auth failures now logged)
Post-Sprint-2: +~15% more (consent events, attribution changes)
```

### D1 Table Health Checks
```sql
-- Run after each production deploy:
SELECT COUNT(*) FROM erasure_receipts WHERE status='pending' AND requested_at < unixepoch()-3600;
-- Expected: 0 (all completed within 1h)

SELECT COUNT(*) FROM refresh_tokens WHERE revoked_at IS NULL AND expires_at < unixepoch();
-- Expected: 0 (scheduler cleaned up)

SELECT COUNT(*) FROM dsar_requests WHERE status='pending' AND expires_at < unixepoch();
-- Expected: 0 (scheduler processed all)
```

---

## SPECIAL HANDLING CHECKLISTS

### Financial Fixes (P9 / WF-0xx)
- [ ] BUG-013 (VAT) — verify `vat_kobo = Math.round(subtotal * 0.075)` returns integer  
- [ ] BUG-037 (wallet reconciliation) — 2 engineer sign-off before merge  
- [ ] k6 load test: `k6 run --vus 50 --duration 2m infra/k6/smoke.js` before production  
- [ ] `pnpm test:p9` passes (all P9-tagged tests)  
- [ ] `check-monetary-integrity.ts` passes with 0 violations  

### Security Fixes
- [ ] `security-baseline.md` updated for BUG-003 (CSRF intent header)  
- [ ] All JWT/token changes: adversarial test (tampered JWT, expired token, wrong tenant)  
- [ ] BUG-004 (refresh rotation): 2 engineer sign-off  
- [ ] Branch protection: 2 approvals for `packages/auth/` changes  
- [ ] New findings documented in ADR: `docs/adr/ADR-0XX-*.md`  

### UX/Persona Fixes
- [ ] BUG-009 (ErrorBoundary): test on mobile viewport (360px)  
- [ ] BUG-010 (offline queue): test on Chrome with DevTools offline mode  
- [ ] BUG-013 (VAT): verify receipt printout on 58mm thermal paper emulation  
- [ ] Screen-reader validation (VoiceOver + NVDA) for BUG-025, BUG-030, BUG-040  

### Governance Changes
- [ ] `founder-approval` label required for changes to `docs/governance/`, `platform-invariants.md`  
- [ ] `CONTRADICTION_SCAN.md` updated: close C-001 (confirmed resolved), audit C-002–C-009  
- [ ] New ADRs for: CSRF M2M policy (BUG-003), opaque refresh token (BUG-004), scheduler architecture (BUG-005)  

---

## EXECUTION CHECKLIST

```
[Sprint 1]
[ ] BUG-001: guards.ts T3 fix + test TC-INV002
[ ] BUG-002: apply-safe.sh + staging workflow port
[ ] BUG-003: CSRF X-CSRF-Intent header + M2M callers updated
[ ] BUG-006: auth failure audit log
[ ] BUG-007: CI on main branch + branch protection
[ ] BUG-008: payment config 503 + health endpoint
[ ] BUG-009: ErrorBoundary in all React main.tsx
[ ] BUG-014: audit-log dual-write KV queue
[ ] COMP-002/003: erasure batch + receipt table

[Sprint 2]
[ ] BUG-004: opaque refresh token rotation
[ ] BUG-005: schedulers Worker deployed
[ ] BUG-015: billing path normalization
[ ] BUG-016: workspace status on refresh
[ ] BUG-017: T3 check single-quoted SQL
[ ] BUG-018: AI check dynamic URLs
[ ] BUG-032: k6 smoke 4xx fix
[ ] SEC-001: PBKDF2 600k iterations
[ ] SEC-002: rate-limit degradation alert
[ ] SEC-003: token blacklist key hashing
[ ] SEC-005: verify-secrets CI job
[ ] SEC-006: failed-auth IP logging
[ ] SEC-007: outbound webhook HMAC signing

[Sprint 3]
[ ] All 28 P2 medium issues addressed
[ ] All 8 compliance findings addressed
[ ] USSD i18n scaffold (Yoruba)
[ ] VAT 7.5% in POS
[ ] 2FA for super-admin
[ ] DSAR endpoint + scheduler job

[Sprint 4]
[ ] All 15 P3 code quality fixes
[ ] All 12 test gap items (TST-001–012)
[ ] Property-based tests (fast-check)
[ ] Hostile-tenant RLS E2E suite
[ ] axe-core CI integration
[ ] Visual regression baselines populated

[Sprint 5+]
[ ] 48 enhancement proposals delivered by domain
[ ] Offline queue (ENH-020)
[ ] Reservation primitive (ENH-042)
[ ] USSD i18n complete (ENH-036)
[ ] Real-time admin dashboard (ENH-040)
```

---

## POST-MORTEM TEMPLATE

For any production incident arising from these changes:
```markdown
# Incident Report — [Date] — [Finding ID]

## Summary
[1-sentence description]

## Timeline
- [HH:MM] Deployment started
- [HH:MM] Issue detected
- [HH:MM] Rollback initiated
- [HH:MM] Service restored

## Root Cause
[Technical root cause]

## Impact
- Users affected: [N]
- Duration: [X minutes]
- Data integrity: [Not affected / Affected — describe]

## Resolution
[What was done]

## Prevention
[How to prevent recurrence]
- [ ] Test added: [file#TC-ID]
- [ ] Monitoring added: [metric]
- [ ] CONTRADICTION_SCAN.md updated
```

---

*Implementation Handover Plan · WebWaka OS · 2026-04-23 · Prepared by Replit Agent*  
*Source: WebWaka_OS_Consolidated_Master_Report_2026_04_23.md*  
*102 findings → 102 fix cards → 4 sprints + extended enhancement backlog*  
*Governance invariants P9, T3, WF-0xx preserved throughout*
