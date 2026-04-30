# Blue-Green Deployment Strategy (L-4)

## Overview

This document outlines the blue-green deployment strategy for WebWaka's
Cloudflare Workers, enabling instant rollback (<30 seconds) without
re-running the full pipeline.

## Architecture

```
          ┌─────────────────┐
          │  CF DNS / Route  │
          │  api.webwaka.com │
          └────────┬────────┘
                   │ Routes to active environment
          ┌────────┴────────┐
          │                 │
    ┌─────┴─────┐   ┌─────┴─────┐
    │   BLUE    │   │   GREEN   │
    │ webwaka-  │   │ webwaka-  │
    │ api-blue  │   │ api-green │
    └───────────┘   └───────────┘
```

## Implementation Plan

### Phase 1: Environment Aliasing (Current Sprint)

Use Cloudflare Workers environment aliasing:
- `webwaka-api` (production traffic via route)
- Version deployments tracked via `wrangler deployments list`
- `wrangler rollback` for instant revert to previous version

### Phase 2: Route-Based Blue-Green (Future)

For true zero-downtime with database migration:
1. Deploy new version to staging worker (green)
2. Run canary traffic (10%) via traffic-shift middleware
3. Monitor metrics for 30 minutes
4. If healthy: shift to 100%
5. If degraded: shift back to 0% (instant)

### Phase 3: Database-Aware Blue-Green

When migrations have breaking changes:
1. Apply forward-compatible migration (both versions can read)
2. Deploy new worker (green) alongside old (blue)
3. Gradual traffic shift
4. After 100% on green: drop backward compatibility in next migration

## Current Rollback Procedure

```bash
# List deployments:
wrangler deployments list --name webwaka-api --env production

# Instant rollback to previous:
wrangler rollback --name webwaka-api --env production

# Verify:
curl https://api.webwaka.com/health/version
```

## SLA

- Rollback time: <30 seconds (wrangler rollback)
- Canary detection: 5 minutes (via traffic-shift middleware)
- Full switch: Instant (DNS/route change)
