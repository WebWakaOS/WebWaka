# DEV-07: Local Development Setup Guide

**Phase 17 / Sprint 14 — WebWaka OS**

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥20.x | Use the version in `.nvmrc` if present |
| pnpm | ≥9.x | `npm install -g pnpm` |
| tsx | bundled | Used by governance scripts |
| Git | any | Required for hooks |

---

## 1. Clone and install

```bash
git clone https://github.com/webwaka-os/platform.git
cd platform
pnpm install
```

pnpm installs all workspace packages in a single command. The monorepo root `pnpm-workspace.yaml` references `apps/*` and `packages/*`.

---

## 2. Environment variables

WebWaka uses Cloudflare D1 + Workers in production. Locally you use Miniflare's in-memory D1 emulation via Vitest.

**No `.env` file is needed for running tests.** Test files inject bindings directly (see `apps/api/src/routes/*.test.ts` patterns).

For running the platform-admin static server:

```bash
# No env vars required — it serves static files only
node apps/platform-admin/server.js
# → http://localhost:5000
```

---

## 3. Running tests

```bash
# All tests (2328+ tests, 0 failures expected)
cd apps/api && npx vitest run

# Watch mode during development
cd apps/api && npx vitest

# Single file
cd apps/api && npx vitest run src/routes/billing.test.ts
```

Test output reports are in `apps/api/coverage/` when run with `--coverage`.

---

## 4. Governance checks

All 11 governance checks must pass before any push. Run them manually:

```bash
# Run all 11 checks
for script in scripts/governance-checks/*.ts; do npx tsx "$script"; done

# Or check individual scripts in scripts/governance-checks/
ls scripts/governance-checks/
```

Checks cover: tenant isolation, monetary type enforcement, auth pattern, migration ordering, route registration, and more.

---

## 5. Database migrations

Migrations live in `infra/db/migrations/`. Each has a `.sql` (forward) and `.rollback.sql` file.

```bash
# Applying to a local D1 (Miniflare)
npx wrangler d1 execute DB --local --file=infra/db/migrations/0001_init.sql

# Apply all migrations in order
ls infra/db/migrations/*.sql | grep -v rollback | sort | xargs -I{} npx wrangler d1 execute DB --local --file={}

# Rollback last migration
npx wrangler d1 execute DB --local --file=infra/db/migrations/0228_subscription_plan_history.rollback.sql
```

Current migration count: **228** (through Phase 17 / Sprint 14).

---

## 6. Package codegen

When adding or modifying types in `packages/types/`:

```bash
# Rebuild all generated types
pnpm --filter @webwaka/types run build

# Rebuild all packages (respects dependency graph)
pnpm -r run build
```

---

## 7. Service Worker development

The service workers (`apps/*/public/sw.js`) use a `__CACHE_VERSION__` token that is replaced at build time by `scripts/build-sw.ts`.

In local dev, the SW uses the `'dev'` fallback automatically — no manual intervention needed.

For a production-like build:

```bash
npx tsx scripts/build-sw.ts
```

---

## 8. Common issues

### Port 5000 already in use

```bash
lsof -ti:5000 | xargs kill -9
node apps/platform-admin/server.js
```

### TypeScript errors on first clone

```bash
pnpm -r run build   # builds all packages in dependency order
```

### Tests fail with "Cannot find module"

Ensure packages are built (`pnpm -r run build`) before running API tests, since `apps/api` imports from `packages/`.

---

## 9. Monorepo structure (quick reference)

```
apps/
  api/              — Hono API (Cloudflare Workers target)
  admin-dashboard/  — Workspace admin PWA (static)
  partner-admin/    — Partner operator PWA (static)
  platform-admin/   — Internal platform admin (Express static)

packages/
  types/            — Shared TypeScript types + Zod schemas
  entities/         — Entity CRUD helpers
  geography/        — D1-backed geography index
  ai/               — AI provider abstraction
  ...201 more packages

infra/
  db/migrations/    — 228 D1 migration files (forward + rollback)
  cloudflare/       — Wrangler config, Workers routes

scripts/
  governance-checks/ — 11 enforcement scripts
  build-sw.ts        — SW cache versioning

docs/
  architecture/decisions/ — 18 ADRs
  ops/                    — Operations guides
  enhancements/           — Enhancement roadmap
```
