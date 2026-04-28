# WebWaka OS — Security Posture Runbook

**Status:** Phase 6 / E36 — Pre-Launch Security Review  
**Date:** 2026-04-28  
**Authority:** PRD §13, AC-SEC-01 through AC-SEC-04

---

## 1. Security Scan Results (2026-04-28)

### Dependency Audit
- **Critical:** 0
- **High:** 0
- **Moderate:** 2 (non-critical transitive dependencies; no exploit path identified)
- **Low:** 0
- **Verdict:** AC-SEC-01 SATISFIED — Zero high-severity dependency vulnerabilities

### SAST (Static Analysis)
- Platform: Cloudflare Workers (edge-first, no server process)
- No eval(), dynamic require(), or code injection vectors found
- All SQL queries use parameterized binding (`?` placeholders) — no string interpolation
- **Verdict:** Zero injection-class vulnerabilities

### Privacy / PII Dataflow
- P13 invariant enforced: no PII fields in any log or AI context
- P10 invariant enforced: NDPR consent gate before any personal data collection
- DSAR endpoint operational: `POST /compliance/dsar/request`
- PII pseudonymization scheduler operational: `pii-data-retention` job
- **Verdict:** NDPR compliance architecture in place

---

## 2. Platform Security Invariants

| Invariant | Description | Enforcement |
|-----------|-------------|-------------|
| T3 | Every DB query scoped to `tenant_id` from JWT | `authMiddleware` + parameterized queries |
| P9 | All monetary values as integer kobo | TypeScript types + no float/string paths |
| P10 | NDPR consent before PII capture | `assertConsentExists` in `packages/identity` |
| P13 | No PII in AI requests or logs | SuperAgent SDK strips PII before forwarding |
| G23 | `audit_logs` is append-only | No UPDATE/DELETE statements on audit_logs anywhere |
| P15 | Content moderation before UGC write | `content_moderation` AI capability pre-write gate |

---

## 3. Authentication and Authorization

- **JWT**: RS256 signed tokens with `userId`, `tenantId`, `role` claims
- **Auth middleware**: Applied to all protected routes via `apps/api/src/middleware/auth.ts`
- **Role gates**: `requireRole()` middleware enforced for admin/super_admin routes
- **Plan entitlement gates**: `requireEntitlement(PlatformLayer)` enforced for plan-gated features
- **Session revocation**: Opaque refresh tokens; `/auth/logout` invalidates session (BUG-004 fix)
- **Rate limiting**: 
  - Login: 10/min per IP
  - OTP: 5/hr per phone (SMS/WhatsApp), 3/hr (Telegram)
  - Identity lookup: 2 BVN/NIN lookups per user per hour (KV-backed)

---

## 4. SSRF Protection

Outbound webhook URL validation (`apps/api/src/routes/webhooks.ts`):
- Blocks loopback addresses (localhost, 127.x.x.x, ::1)
- Blocks RFC1918 private ranges (10.x, 172.16-31.x, 192.168.x)
- Blocks link-local (169.254.x) and CGNAT (100.64-127.x) ranges
- Blocks `.internal`, `.local`, `.localhost` TLDs
- Only `http://` and `https://` schemes allowed

---

## 5. Content Security

- **Outbound webhooks**: HMAC-SHA256 signed via `packages/webhooks/src/signing.ts`
  - Header: `X-WebWaka-Signature: sha256=<hex>`
  - Constant-time comparison to prevent timing attacks
- **Paystack webhooks**: Signature verified before processing (`verifyWebhookSignature`)
- **SQL injection**: All D1 queries use `?` bind parameters — no string concatenation
- **XSS**: Hono JSON responses set `Content-Type: application/json` — no HTML rendering in API

---

## 6. Data Protection (NDPR/GDPR-equivalent)

- **Consent model**: Layered consent (general NDPR + per-AI-capability consent)
- **Data retention**: Automated pseudonymization via `DataRetentionService`:
  - `donor_phone` → `REDACTED` after 365 days
  - `pledger_phone` → `REDACTED` after 365 days  
  - `subject_name`, `subject_phone` in cases → `REDACTED` after 730 days
- **DSAR processing**: Within 72 hours via scheduler job
- **Right to erasure**: Pseudonymization on retention expiry (NDPR Art. 2.8)
- **Audit log retention**: 7 years (policy_rules: `audit_log_retention_days = 2555`)

---

## 7. API Security Headers

All API responses include:
- `Content-Type: application/json`
- `X-API-Version: 1` (Phase 6 / ADR-0018)
- `Cache-Control: public, max-age=...` on geography/public endpoints

Missing headers (to add before public launch):
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Frame-Options: DENY`

---

## 8. Secrets Management

- All secrets stored in Cloudflare KV / environment variables — never in code
- Secret rotation schedule: 90-day cycle (see `infra/cloudflare/secrets-rotation-log.md`)
- DSAR bucket encryption: Cloudflare R2 at-rest encryption (default)

---

## 9. Pre-Launch Security Checklist (AC-SEC-01 to AC-SEC-04)

| Criterion | Status |
|-----------|--------|
| AC-SEC-01: No high-severity findings in automated scan | ✓ PASS (0 critical, 0 high) |
| AC-SEC-02: All endpoints return 401 without valid JWT | ✓ Enforced by `authMiddleware` on all protected routes |
| AC-SEC-03: Cross-tenant data read not possible (T3) | ✓ All queries bind `tenant_id` from JWT |
| AC-SEC-04: PII not in list API responses (P13) | ✓ Enforced — SELECT lists exclude PII columns |

---

## 10. External Audit Prerequisites (E36)

The following items require external engagement before M16 public launch:
- [ ] **Penetration testing**: Commission external security firm (no high/critical findings)
- [ ] **DPA with Prembly**: Data Processing Agreement for BVN/NIN verification
- [ ] **DPA with Paystack**: Data Processing Agreement for payment processing
- [ ] **DPA with Termii**: DPA for SMS/OTP delivery
- [ ] **DPA with Resend**: DPA for email delivery
- [ ] **DPA with Meta/360dialog**: DPA for WhatsApp Business API
- [ ] **NDPR registration**: Complete NITDA registration
- [ ] **Load test**: 1,000 concurrent API requests @ P99 ≤ 300ms

---

## 11. Incident Response

See `docs/runbooks/rollback-procedure.md` for database rollback procedures.

For security incidents:
1. Revoke compromised JWT secret (rotate `JWT_SECRET` environment variable)
2. Invalidate all active sessions via bulk `DELETE FROM sessions WHERE created_at < now`
3. Notify affected tenants within 72 hours (NDPR Art. 2.6 breach notification)
4. Rotate affected API keys (Paystack, Prembly, Termii, Resend)
5. File incident report in `docs/ops/incidents/`
