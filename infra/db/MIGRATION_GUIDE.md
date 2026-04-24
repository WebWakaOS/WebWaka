# WebWaka OS — D1 Migration Guide

**BUG-P3-017 fix:** This document resolves the deployment uncertainty created by
having two migration directories. It is the canonical reference for running migrations.

---

## Migration Directories

| Directory | Used by | Applied via |
|-----------|---------|-------------|
| `apps/api/migrations/` | `apps/api` Worker | `wrangler d1 migrations apply` in `apps/api/` |
| `infra/db/migrations/` | Canonical shared schema | Manual apply or future migration runner |

### Why two directories?

- **`apps/api/migrations/`** — Wrangler's `migrations_dir = "migrations"` in `apps/api/wrangler.toml` resolves here. Wrangler tracks applied migrations in the `d1_migrations` table.
- **`infra/db/migrations/`** — Canonical schema source with full rollback companions. CI governance checks (`check-migration-rollbacks.ts`) run against this directory. These are the source-of-truth files.

The CI/CD deployment pipeline applies migrations from `apps/api/migrations/`. When a new migration is added, it **must** appear in **both** directories:

1. Add `NNNN_description.sql` to `infra/db/migrations/` (authoritative + rollback)
2. Copy the forward migration to `apps/api/migrations/` (wrangler applies it)

---

## Applying Migrations

### Staging

```bash
cd apps/api
wrangler d1 migrations apply webwaka-os-staging --env staging
```

### Production

```bash
cd apps/api
wrangler d1 migrations apply webwaka-os-production --env production
```

### Local dev

```bash
cd apps/api
wrangler d1 migrations apply webwaka-main --local
```

---

## Rolling Back

Each migration in `infra/db/migrations/` has a companion `.rollback.sql`:

```bash
# Apply the rollback directly (no wrangler rollback command for D1 yet)
cd apps/api
wrangler d1 execute webwaka-os-staging --env staging \
  --file=../../infra/db/migrations/NNNN_description.rollback.sql
```

---

## Migration Naming Convention

```
NNNN_short_description.sql
NNNN_short_description.rollback.sql
```

- `NNNN` — zero-padded 4-digit sequence number
- Next available: check `ls infra/db/migrations/*.sql | tail -1`

---

## New Migration Checklist

- [ ] Add forward migration to `infra/db/migrations/NNNN_description.sql`
- [ ] Add rollback migration to `infra/db/migrations/NNNN_description.rollback.sql`
- [ ] Copy forward migration to `apps/api/migrations/NNNN_description.sql`
- [ ] Test locally: `wrangler d1 migrations apply webwaka-main --local`
- [ ] Add governance review comment documenting the schema change
- [ ] Update `docs/governance/compliance-dashboard.md` if the migration affects compliance state

---

*Last updated: 2026-04-24 (BUG-P3-017 fix — deployment uncertainty resolved)*
