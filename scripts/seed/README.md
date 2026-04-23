# WebWaka OS — QA Seed Data Scripts

**Source:** `WebWaka_OS_QA_Execution_Plan.md` v1.0, Section 3 (Seed Data Setup)  
**Frozen baseline:** `WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN`  
**DO NOT MODIFY** seed IDs, amounts, or role assignments without matrix owner approval.

## Usage

### Staging (ENV-01) — recommended

```bash
# Apply all D1 migrations first
wrangler d1 migrations apply webwaka-db --env staging

# Then run seeds in phase order (each phase depends on the previous)
wrangler d1 execute webwaka-db --env staging --file=scripts/seed/phase-1-users.sql
wrangler d1 execute webwaka-db --env staging --file=scripts/seed/phase-2-tenants.sql
wrangler d1 execute webwaka-db --env staging --file=scripts/seed/phase-3-partners.sql
wrangler d1 execute webwaka-db --env staging --file=scripts/seed/phase-4-financial.sql
wrangler d1 execute webwaka-db --env staging --file=scripts/seed/phase-5-offerings.sql
wrangler d1 execute webwaka-db --env staging --file=scripts/seed/phase-6-notifications.sql
wrangler d1 execute webwaka-db --env staging --file=scripts/seed/phase-7-fx-rates.sql
wrangler d1 execute webwaka-db --env staging --file=scripts/seed/phase-8-ussd-sessions.sql
```

### Local (ENV-03)

```bash
# Same commands but without --env staging
wrangler d1 execute webwaka-db --local --file=scripts/seed/phase-1-users.sql
# ... repeat for phases 2–8
```

### Reset destructive tests (after each destructive test cycle)

```bash
wrangler d1 execute webwaka-db --env staging --file=scripts/reset/reset-after-destructive.sql
```

## Seed phase dependencies

```
Phase 1 (Users) → Phase 2 (Tenants + Workspaces) → Phase 3 (Partners)
Phase 2 → Phase 4 (Financial: wallets, bank-transfer orders)
Phase 2 → Phase 5 (Offerings, templates, RFQ/BID/PO)
Phase 2 → Phase 6 (Notifications)
(no dependency) → Phase 7 (FX rates — global)
Phase 1 → Phase 8 (USSD sessions)
```

## Seed IDs (QA canonical references)

All seed IDs are UUIDs in `00000000-0000-4000-a000-XXXXXXXXXXXX` format where XX encodes the
seed sequence number. This guarantees stable, predictable test references across runs.

| Seed ID | Description |
|---|---|
| USR-001 through USR-013 | Test users (see phase-1-users.sql) |
| TNT-001 through TNT-007 | Test tenants (see phase-2-tenants.sql) |
| PTN-001, PTN-002 | Test partners (see phase-3-partners.sql) |
| WLT-001 through WLT-003 | Test wallets (see phase-4-financial.sql) |
| BTO-001 through BTO-004 | Bank transfer orders (see phase-4-financial.sql) |
| OFF-001 through OFF-003 | Offerings for TNT-001 (see phase-5-offerings.sql) |
| PROD-001, PROD-002 | Offerings for TNT-003 (see phase-5-offerings.sql) |
| TPL-001 | Template registry entry (see phase-5-offerings.sql) |
| RFQ-001, BID-001, PO-001 | B2B marketplace records (see phase-5-offerings.sql) |
| NTF-001 through NTF-003 | Notification inbox rows (see phase-6-notifications.sql) |
| PREF-001, TMPL-001 | Notification preferences + template (see phase-6-notifications.sql) |
| FX-001 through FX-005 | FX rate rows (see phase-7-fx-rates.sql) |
| USSD-001 through USSD-003 | USSD session stubs (see phase-8-ussd-sessions.sql) |

## CRITICAL: P6 compliance

Passwords in seed scripts use bcrypt-hashed values, never plaintext.  
No real PII (BVN, NIN, real phone numbers) is ever present in seed data.  
All phone numbers use the `+23480000XXXXX` range (test-only range per execution plan).

## Reset triggers (see reset/reset-after-destructive.sql)

| Trigger | TC-ID |
|---|---|
| After NDPR hard delete of NTF-002 | TC-N006 |
| After support ticket closed | TC-S001 |
| After BTO-003/BTO-004 dispute flow | TC-F007, TC-F008 |
| After USSD rate-limit exhaustion on +2348000000020 | TC-US010 |
| After identity rate-limit exhaustion on USR-002 | TC-ID002 |
| After free-tier limit tests on TNT-002 | TC-MON001, TC-MON003, TC-MON005 |
