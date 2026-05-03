# WebWaka OS

## Overview

WebWaka OS is a multi-tenant, multi-vertical, white-label SaaS platform operating system designed for Africa, with an initial focus on Nigeria. It adheres to "Offline First," "Mobile First," and "Nigeria First" principles, utilizing a governance-driven monorepo architecture. The platform aims to establish a comprehensive digital infrastructure across various Nigerian sectors, featuring extensive seeded data, robust notification and payment systems, B2B marketplace tools, and identity verification capabilities. Its vision is to empower African businesses and individuals through a scalable and adaptable operating system for diverse vertical markets. Key capabilities include nationwide entity seeding, a comprehensive wallet and payment infrastructure, a production-ready multi-channel notification engine, advanced identity verification and KYC, entitlement-gated access control, and a robust API with CI/CD.

## User Preferences

- **Communication Style**: Direct and concise. Avoid verbose explanations for routine tasks.
- **Problem Solving**: Prioritize solutions that adhere to established architectural patterns and governance rules.
- **Code Generation**: Ensure generated code is type-safe (TypeScript strict mode), well-tested, and follows the monorepo structure.
- **Deployment**: Assume a Cloudflare Workers environment for all deployments (D1, KV, R2).
- **Security**: Implement robust security measures, including tenant isolation (T3), secure authentication (JWT), and protection against common vulnerabilities (SQL injection, HTML injection, timing attacks).
- **Data Handling**: All monetary values must be stored as integer kobo (NGN × 100). Personal Identifiable Information (PII) must be handled according to NDPR guidelines, including consent gates for AI processing and anonymization where appropriate.
- **Workflow**: Iterative development with clear phase completion and adherence to defined milestones.
- **Interaction**: Ask for confirmation before making significant architectural changes or deploying to production.
- **Testing**: Maintain high test coverage; all new features require associated tests (unit, integration, E2E).
- **Documentation**: Keep `replit.md` and `docs/` up-to-date with current status, architectural decisions, and bug fixes.
- **Constraints**: Be mindful of Cloudflare D1 capacity limits and optimize migrations for efficient application.

## System Architecture

The system employs a serverless, edge-first architecture leveraging Cloudflare Workers.

### UI/UX Decisions
- **Mobile-first Design**: Frontend applications use React and PWA for an "Offline First" and "Mobile First" experience.
- **Design System**: A shared design system (`@webwaka/design-system`) and white-label theming (`@webwaka/white-label-theming`) ensure UI consistency and brand adaptability.
- **Admin Interfaces**: Dedicated dashboards for platform, general, and partner administration.

### Technical Implementations
- **Monorepo Structure**: Organized into `apps/` for deployable applications and `packages/` for reusable libraries.
- **Language**: TypeScript with strict mode.
- **API Framework**: Hono for efficient, edge-optimized API development.
- **Database Interaction**: Cloudflare D1 (SQLite) with a robust migration system, enforcing `tenant_id` for strict data isolation (T3).
- **State Machines**: Implemented for complex workflows such as claim lifecycles and wallet transactions.
- **Notification Engine**: Multi-channel (InApp, Email, SMS, WhatsApp, Telegram, FCM, Slack, Teams) with rule engine, templating, and digest capabilities, processed via Cloudflare Queues with an outbox pattern.
- **Payment & Wallet System**: Comprehensive wallet functionality supporting transfers, withdrawals, and online funding, with flexible payment modes.
- **Identity Verification**: Integrates with third-party services for BVN/NIN verification, including fallback mechanisms and rate limiting.
- **Sector Licence Verification**: Manual document-upload and admin-review workflow using a Finite State Machine.
- **AI Integration**: Vendor-neutral abstraction layer (`@webwaka/superagent`) with strict consent gates for NDPR compliance, AI agent sessions, tool execution loop, and built-in platform tools.
- **Search & Discovery**: FTS5 for full-text search and `search_entries` for discoverability.
- **Geo-spatial Data**: `@webwaka/geography` provides hierarchical geographical data for Nigeria, Ghana, and Kenya.
- **Testing**: Extensive test suites using Vitest for unit/integration and Playwright for E2E testing.
- **CI/CD**: GitHub Actions for automated type checking, testing, linting, security auditing, and deployment.
- **Dynamic Configurability & Delegated Governance**: Implemented via `@webwaka/control-plane` package for runtime services like Plan Catalog, Entitlement Engine, Permission Resolver, Flag Service, Delegation Guard, and Audit Service. This supports dynamic pricing, entitlements, roles, groups, feature flags, and delegation policies, with a dashboard for administration.
- **Universal Module Platform (UMP)**: Core platform refactoring introducing `groups`, `cases`, and `ledger` packages, featuring a policy engine and differential offline sync for PWAs.
- **WakaPage**: A no-code landing page builder vertical with lead management and search indexing integration.
- **Workflow Engine**: MVP for starting and advancing workflows with seeded definitions.
- **Analytics Unification**: `trackEvent` with PII stripping and methods for metrics.
- **Fundraising Extensions**: Dues collection and mutual aid functionalities.
- **Template System**: Extended template registry to include `module_config`, `vocabulary`, `default_policies`, and `default_workflows` for starter templates.
- **Data Retention Automation**: Scheduled pseudonymization of expired PII for NDPR compliance.
- **Moderation Appeal Flow**: System for users to appeal content moderation decisions.
- **Public API Versioning**: Global `X-API-Version` header and a `/developer` endpoint for API metadata.
- **Webhook SDK**: TypeScript event payload types for all webhook events.

### Feature Specifications
- **Nationwide Entity Seeding**: Multi-phase data ingestion for diverse Nigerian entities with provenance tracking.
- **Claim & Activation Flow**: Multi-step process for entities to claim profiles and activate services.
- **Configurable Bank Accounts**: Supports platform and workspace-specific bank accounts.
- **Tenant Branding**: API for custom branding (colors, logos, custom domains).
- **Profile Visibility**: Workspace admins control public, semi, or private profile visibility.

### System Design Choices
- **Edge-first**: Leverages Cloudflare Workers for low-latency and scalability.
- **Stateless Workers**: Most Workers are stateless, relying on D1, KV, and R2 for persistence.
- **Immutable Data Patterns**: Emphasizes idempotent operations and audit logging.
- **Modular Design**: Clear separation of concerns with domain-specific packages.
- **Scalable Notification Pipeline**: Decoupled notification generation from delivery via Cloudflare Queues.

## External Dependencies

- **Cloudflare**: Workers, D1, KV, R2, Queues, DNS.
- **Termii**: SMS Gateway.
- **Resend**: Email service.
- **Meta/Dialog360 WhatsApp**: WhatsApp Business API.
- **Telegram**: Messaging platform.
- **Firebase Cloud Messaging (FCM)**: Push notifications.
- **Slack**: Internal team notifications.
- **Microsoft Teams**: Internal team notifications.
- **Paystack**: Payment gateway (optional).
- **Prembly**: Identity verification APIs (BVN, NIN, CAC, FRSC).
- **OpenStreetMap (Overpass API)**: Geo-spatial entity data.
- **Wikipedia**: Political entity data.
- **INEC (Independent National Electoral Commission)**: Electoral data.
- **UBEC (Universal Basic Education Commission)**: School data.
- **NUPRC (Nigerian Upstream Petroleum Regulatory Commission)**: Oil and gas operators.
- **NAICOM (National Insurance Commission)**: Insurance entities.
- **CBN (Central Bank of Nigeria)**: Regulated financial institutions.
- **NCC (Nigerian Communications Commission)**: Licensed telecom operators.
- **SEC (Securities and Exchange Commission) Nigeria**: Capital market operators.
- **NHIA (National Health Insurance Authority)**: Accredited healthcare providers.
- **NPHCDA (National Primary Health Care Development Agency)**: Primary Health Care facilities.
- **MLSCN (Medical Laboratory Science Council of Nigeria)**: MLS/MLA-T training institutions.
- **NUC (National Universities Commission)**: Universities registry.
- **GRID3 / HDX**: Health facilities data.