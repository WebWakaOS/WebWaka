# ADR-0026: End-to-End Encryption for Direct Messages

## Status

Proposed (Design Phase)

## Context

WebWaka currently uses AES-256-GCM with a server-held `DM_MASTER_KEY` for
encrypting direct messages between users. While this protects data at rest
and in transit, it means the platform operator has access to all message content.

For true end-to-end encryption (E2E), we need client-side keys where only
the communicating parties can decrypt messages.

## Current Implementation

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│ Client A │ ──────▸ │   API    │ ──────▸ │ Client B │
│          │  Plain  │          │  Plain  │          │
│ Encrypt  │  text   │ Re-enc   │  text   │ Decrypt  │
│ (master) │         │ at rest  │         │ (master) │
└──────────┘         └──────────┘         └──────────┘
                         ⬆
                    DM_MASTER_KEY
                    (server-held)
```

## Proposed Design: Double-Ratchet Protocol (Signal-Inspired)

### Phase 1: Key Exchange Infrastructure

1. Each user generates an Ed25519 identity key pair on device
2. Public key is uploaded to server during onboarding
3. Pre-key bundles (X3DH) are generated and stored on server
4. When initiating a DM, client fetches recipient's pre-key bundle

### Phase 2: Message Encryption

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│ Client A │ ──────▸ │   API    │ ──────▸ │ Client B │
│          │ Cipher  │          │ Cipher  │          │
│ Encrypt  │  text   │  Store   │  text   │ Decrypt  │
│ (shared) │         │ (opaque) │         │ (shared) │
└──────────┘         └──────────┘         └──────────┘
      ⬆                                        ⬆
  Shared secret                           Shared secret
  (client-only)                           (client-only)
```

### Phase 3: Migration Path

1. New messages use E2E encryption
2. Existing messages remain encrypted with master key (read-only)
3. Users can optionally re-encrypt existing conversations client-side
4. Server gradually purges master-key-encrypted messages after 180 days

## Technical Challenges

| Challenge | Mitigation |
|-----------|-----------|
| Key storage on client | Web Crypto API + IndexedDB (encrypted) |
| Multi-device sync | Per-device sub-keys derived from identity key |
| Offline delivery | Store-and-forward with encrypted payloads |
| Group messages | Sender keys (MLS-style) for groups |
| Key rotation | Automatic ratcheting per message |
| Device compromise | Remote revocation via identity key |
| Regulatory compliance | Metadata (sender, timestamp) remains accessible |

## Constraints

- USSD users cannot do E2E (no crypto capability) — excluded from scope
- Web app users need Web Crypto API support (modern browsers only)
- Mobile PWA users get same protection as web
- Admin HITL (human-in-the-loop) content moderation loses DM visibility
  → Requires reported-message disclosure flow

## Decision

**Defer to Phase 3** of the platform security roadmap.

Current AES-GCM with server-held key is acceptable for the Nigerian market
given that:
1. Data is encrypted at rest (D1 + R2)
2. Transit is encrypted (HTTPS + CF edge)
3. Operator access is controlled (audit logged)
4. Regulatory requirements (NDPR) don't mandate E2E for platform messages

## Action Items

- [ ] Research Web Crypto API key storage limitations
- [ ] Prototype X3DH key exchange in @webwaka/crypto package
- [ ] Design migration API for existing messages
- [ ] Legal review of E2E implications for content moderation
