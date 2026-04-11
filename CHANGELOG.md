# Changelog

All notable changes to WebWaka OS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- SEC-001: JWT authentication on admin-dashboard routes
- SEC-002: JWT authentication on platform-admin claims routes
- SEC-003: Full tenant isolation on all claim_requests queries
- SEC-004: Persistent audit_logs table (migration 0193) with D1 write middleware
- SEC-005: Production-safe CORS — localhost excluded in production mode
- SEC-006: Security headers (secureHeaders) on all apps: brand-runtime, public-discovery, ussd-gateway, platform-admin
- SEC-007: Release governance documentation aligned to actual workflow
- SEC-008: Secret rotation tracking log with documented procedures
- ENT-001: Entitlement middleware for vertical route access control
- ENT-002: AI entitlement check on all SuperAgent routes
- AI-001: HITL tables (ai_hitl_queue, ai_hitl_events) — migration 0194
- AI-003: Financial table write prohibition guard for AI-initiated operations
- AI-004: USSD exclusion middleware on all AI entry points
- CI-001: Governance invariant CI checks (tenant isolation, AI direct calls, monetary integrity, CORS)
- CI-002: Frozen lockfile enforcement in CI; removed stale package-lock.json

### Fixed
- CORS fallback no longer includes localhost in production
- Audit log middleware now persists entries to D1 (previously console-only)

### Security
- All destructive/financial routes now emit persistent audit log entries
- Free-plan workspaces blocked from SuperAgent AI features (403)
- USSD sessions rejected on all AI endpoints (P12)
- AI cannot write to financial tables without human approval
