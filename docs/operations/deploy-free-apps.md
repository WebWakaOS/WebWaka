# INF-008: Intentionally Deploy-Free Applications

**Status:** Documented — no action required  
**Last verified:** 2026-04-24  
**Branch context:** `staging`

---

## Overview

Not every application in the WebWaka OS monorepo is intended to deploy to Cloudflare Workers as a standalone service. Some are:

1. **Admin UIs** — React SPAs served from a static host or via a different Worker.
2. **Support tooling** — Internal scripts or dashboard apps that are never publicly routed.
3. **Packages only** — TypeScript packages that export code consumed by other Workers; they are never deployed directly.

This document records which apps are intentionally deploy-free and why, so that CI does not flag their absence from the Worker deployment checklist.

---

## Deploy-Free App Registry

| App / Package | Path | Reason not deployed as a standalone Worker |
|---|---|---|
| `platform-admin` | `apps/platform-admin/` | Internal SSR Node.js app; served behind VPN/Cloudflare Access. Not a CF Worker. |
| `workspace-app` | `apps/workspace-app/` | React + Vite SPA; deployed as static assets to Cloudflare Pages, not a CF Worker. |
| `@webwaka/payments` | `packages/payments/` | Library package; no HTTP surface. Imported by `apps/api`. |
| `@webwaka/notifications` | `packages/notifications/` | Library package; no HTTP surface. Imported by `apps/api` and `apps/notificator`. |
| `@webwaka/geo` | `packages/geo/` | Library package; no HTTP surface. Imported by `apps/api` and `apps/public-discovery`. |

---

## Deployed Workers (reference)

| App | Path | Cloudflare Worker name |
|---|---|---|
| `api` | `apps/api/` | `webwaka-api` |
| `public-discovery` | `apps/public-discovery/` | `webwaka-discovery` |
| `ussd-gateway` | `apps/ussd-gateway/` | `webwaka-ussd` |
| `notificator` | `apps/notificator/` | `webwaka-notificator` |
| `telegram-bot` | `apps/telegram-bot/` | `webwaka-telegram` |

---

## CI Guidance

The `governance-check.yml` workflow must NOT fail for missing `wrangler deploy` steps for apps in the "Deploy-Free App Registry" above. Any CI check that validates Worker deployments should exclude these paths.

If a deploy-free app is later promoted to a CF Worker, update this document and add a `wrangler.toml` to the app's directory.
