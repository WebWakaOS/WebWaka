# WebWaka OS

## Overview

WebWaka OS is a multi-tenant, multi-vertical, white-label SaaS platform operating system for Africa, starting with Nigeria. It follows a governance-driven monorepo architecture with an "Offline First," "Mobile First," and "Nigeria First" philosophy.

**Current Status: Milestone 0 — Architecture & Governance Baseline**

## Tech Stack (Target)

- **Runtime:** Cloudflare Workers (Edge-first)
- **Language:** TypeScript
- **API Framework:** Hono
- **Frontend:** React + PWA
- **Database:** Cloudflare D1 (SQLite at the edge)
- **Cache/Config:** Cloudflare KV
- **Storage:** Cloudflare R2
- **Offline Sync:** Dexie.js + Service Workers
- **AI Integration:** Vendor-neutral abstraction (BYOK capable)
- **Package Manager:** pnpm workspaces

## Project Structure

```
webwaka-os/
  apps/
    api/                  — Cloudflare Workers API (Milestone 1)
    platform-admin/       — Super admin dashboard (running now on port 5000)
    partner-admin/        — Partner/tenant management portal (Milestone 2)
    public-discovery/     — Public search and discovery (Milestone 3)
    brand-runtime/        — Tenant-branded storefronts (Milestone 3)
  packages/               — Shared platform libraries (all placeholder, Milestone 1+)
  docs/                   — Governance, architecture, product, runbooks
  infra/                  — Cloudflare and GitHub Actions infrastructure config
  tests/                  — e2e, integration, smoke tests
```

## Running Locally

The current Replit dev setup runs a Node.js/Express server for the Platform Admin dashboard:

- **Workflow:** `Start application`
- **Command:** `node apps/platform-admin/server.js`
- **Port:** 5000
- **Host:** 0.0.0.0

## Development Notes

- The project is at Milestone 0 — all app and package directories are architecture placeholders
- The actual Cloudflare Workers, React apps, and packages have not been built yet
- The `apps/platform-admin/` directory contains a minimal Express server with a dashboard overview page
- `pnpm` is the intended package manager for the monorepo (configured in `package.json` engines)
- All actual packages require Cloudflare account credentials (see `.env.example`)

## Deployment

- **Target:** autoscale
- **Run command:** `node apps/platform-admin/server.js`
- **Production environment:** Will require Cloudflare credentials for full functionality
