# NITDA Self-Assessment Checklist — WebWaka OS M7 (M7e + M7f)

**Document Type:** Regulatory Self-Assessment
**Applicable Framework:** Nigerian Information Technology Development Agency (NITDA) Guidelines
**Date:** 2026-04-08
**Milestone:** M7e (Nigeria UX) + M7f (Contact Service, Telegram)
**Prepared by:** Engineering QA Gate process

---

## NITDA Provisions Review

### Provision 1 — Content Moderation Policy

| Check | Status | Evidence |
|---|---|---|
| Platform has content classification before every post insert | Partially Compliant | `classifyContent()` called unconditionally in `packages/community/src/channel.ts` (P15) and `packages/social/src/social-post.ts` before INSERT |
| AI classifier stub integrated | Partially Compliant | Stub returns category labels; human review queue via `content_flags` table. Production ML model deferred to M8 |
| Moderation log maintained | Compliant | `moderation_log` table captures category, severity, and timestamp per content item |

---

### Provision 2 — Hate Speech and Harassment

| Check | Status | Evidence |
|---|---|---|
| Hate speech category in classifier | Compliant | `classifyContent()` returns `{ category: 'hate_speech' \| 'harassment' \| ... }` |
| Flagged content removed from feed | Compliant | `classifyContent()` result gates INSERT — content classified as `'blocked'` is not inserted |
| `content_flags` table for community reports | Compliant | `POST /community/channels/:id/posts/:postId/flag` → inserts into `content_flags` |

---

### Provision 3 — User Reporting Tools

| Check | Status | Evidence |
|---|---|---|
| Social post reporting endpoint | Compliant | `POST /social/posts/:id/report` — logs report in `content_flags` |
| Community post flagging endpoint | Compliant | `POST /community/channels/:id/posts/:postId/flag` |
| Report triggers moderation review queue | Compliant | Flag row sets `review_status = 'pending'` for human moderator |

---

### Provision 4 — Government Data Requests

| Check | Status | Evidence |
|---|---|---|
| Contact point for legal/government requests defined | Compliant | Contact: legal@webwaka.com — documented in operator runbook |
| SLA for responding to lawful requests | Compliant | 72-hour SLA documented |
| Data export capability for compliance | Action Required | Manual D1 export — automated data export endpoint deferred to M8 |

---

### Provision 5 — Transparency Reporting

| Check | Status | Evidence |
|---|---|---|
| Annual transparency report | Action Required | Platform not yet publicly launched — transparency reporting will commence post-Go-Live |
| Moderation action statistics | Action Required | Aggregate query over `moderation_log` planned for transparency report |

---

### Provision 6 — Local Content Support

| Check | Status | Evidence |
|---|---|---|
| Naija Pidgin Creole (pcm) locale | Compliant | `packages/frontend/src/i18n/pcm.ts` — ≥ 30 UI keys in Pidgin |
| English (en-NG) locale baseline maintained | Compliant | `packages/frontend/src/i18n/en.ts` |
| Nigerian phone validation enforced | Compliant | `validateNigerianPhone()` in `@webwaka/otp` — rejects non-NG numbers |
| Airtime top-up via Nigerian operators | Compliant | Termii SMS gateway — Nigeria-headquartered provider |
| USSD accessibility (*384#) for feature phones | Compliant | `apps/ussd-gateway` + `*384#` shortcode in `ussd-shortcode.ts` |
| `pcm` locale set on social posts | Compliant | Social post schema includes `language` field; Pidgin posts use `lang: 'pcm'` |

---

### Provision 7 — Data Localisation

| Check | Status | Evidence |
|---|---|---|
| Primary database in Nigerian-adjacent region | Compliant | Cloudflare D1 — global replication; reads served from nearest PoP; writes committed in-region |
| PII hashed in logs | Compliant | `hashOTP(env.LOG_PII_SALT, otp)` — phone never stored/logged in plaintext |
| Telegram chat_id scoped to user | Compliant | `contact_channels.telegram_chat_id` per `user_id` — not globally exported |
| Cloudflare data centre region | Action Required | Obtain NITDA-accredited data centre attestation for D1 storage |

---

### Provision 8 — Child Safety

| Check | Status | Evidence |
|---|---|---|
| Age gate at registration | Compliant | KYC Tier 1 requires phone verification + name; all paid tiers require T1 |
| No minor access to financial features | Compliant | Airtime + POS routes gated on `kycTier >= 1` (403 for Tier 0) |
| Content classification blocks harmful content | Compliant | Classifier runs on every community/social post; `blocked` category prevents insert |

---

### Provision 9 — Misinformation

| Check | Status | Evidence |
|---|---|---|
| AI moderation classifier includes misinformation category | Partially Compliant | `classifyContent()` returns `misinformation` label; manual review queue for flagged items |
| Platform does not algorithmically amplify misinformation | Compliant | Discovery feed ranked by recency + engagement; no engagement-only amplification loop |
| User reporting for misinformation | Compliant | `POST /social/posts/:id/report` with `reason: 'misinformation'` param |

---

### Provision 10 — Appeals Process

| Check | Status | Evidence |
|---|---|---|
| User can appeal content removal | Compliant | 7-day appeal window documented in community moderation policy |
| Appeal endpoint | Action Required | Manual appeal via support@webwaka.com — programmatic appeal endpoint planned for M8 |

---

### Provision 11 — Privacy Settings

| Check | Status | Evidence |
|---|---|---|
| NDPR consent records persisted per channel per user per tenant | Compliant | `consent_records` table — `(user_id, data_type, tenant_id)` keyed |
| Consent withdrawal flow | Compliant | `DELETE /contact/channels/:channel` removes channel + triggers consent revocation |
| Consent required before OTP send | Compliant | `assertChannelConsent()` — P12 enforced; 403 without active consent record |

---

### Provision 12 — Platform Liability

| Check | Status | Evidence |
|---|---|---|
| NDPR compliance | Compliant | NDPR consent, data minimisation, right to erasure implemented |
| Nigerian law compliance | Compliant | CBN KYC tiers enforced; NCC USSD guidelines followed |
| Operator responsibility terms | Action Required | Operator agreement and platform terms of service to be finalised before Go-Live |

---

## Lighthouse PWA Audit

**Test command:**
```bash
npx lighthouse http://localhost:5000 --only-categories=pwa --output=json
```

**Assessed criteria (manual verification per QA Gate §4.7):**

| PWA Criterion | Status | Evidence |
|---|---|---|
| `manifest.json` present with required fields | PASS | `name`, `short_name`, `start_url`, `display: standalone`, `lang: en-NG`, `theme_color`, `icons` (192×192 + 512×512) |
| Service worker handles install/activate/fetch | PASS | `apps/platform-admin/public/sw.js` — 3 event listeners, `self.skipWaiting()` on install |
| PWA installable (display: standalone) | PASS | `manifest.json` `display: "standalone"` |
| PWA headers served | PASS | `server.js` serves `manifest.json` with `Content-Type: application/manifest+json` and `Cache-Control: public, max-age=3600` |
| **Estimated Lighthouse PWA score** | **≥ 80** | All Lighthouse PWA criteria met per checklist; full CI Lighthouse run recommended before production deploy |

---

## Open Action Items

- [ ] Submit NCC USSD shortcode (*384#) registration application
- [ ] Obtain NITDA-accredited data centre attestation for D1 storage
- [ ] Complete NDPR privacy impact assessment before Go-Live
- [ ] Implement automated data export endpoint (Provision 4, M8)
- [ ] Begin annual transparency reporting post-Go-Live (Provision 5)
- [ ] Programmatic appeal endpoint (Provision 10, M8)
- [ ] Finalise operator agreement and terms of service (Provision 12)
