# ADR-0043: End-to-End Encryption for Direct Messages

**Status**: Proposed  
**Date**: 2026-05-01  
**Rule ID**: L-9  
**Deciders**: Platform Engineering, Security, Product  

---

## Context

WebWaka DMs currently use **server-side AES-GCM encryption** (governance rule P14):
- The server holds `DM_MASTER_KEY` as a Cloudflare secret.
- Messages are encrypted at rest in D1 using this master key.
- The server can read all DM content (necessary for moderation, search, compliance).

This is "encryption at rest" — not true End-to-End Encryption (E2EE).

For true E2EE, the server must **never hold the decryption key**. Only the
communicating parties can decrypt. This is the model used by Signal, WhatsApp,
and iMessage.

### Current architecture (P14 / server-side)

```
Client A  →  HTTPS  →  Worker  →  encrypt(content, DM_MASTER_KEY)  →  D1
Client B  ←  HTTPS  ←  Worker  ←  decrypt(ciphertext, DM_MASTER_KEY)  ←  D1
```

The server can always decrypt. Appropriate for:
- Platforms needing content moderation
- Legal hold / compliance obligations
- Search functionality on DM content

### True E2EE architecture (this ADR)

```
Client A  →  encrypt(content, recipient_public_key)  →  HTTPS  →  Worker  →  D1
Client B  ←  decrypt(ciphertext, client_B_private_key)  ←  HTTPS  ←  Worker  ←  D1
```

The server stores only ciphertext. It cannot decrypt.

---

## Problem Analysis

### Why full Signal Protocol is impractical for WebWaka right now

The Signal Protocol (X3DH + Double Ratchet) provides:
- Perfect forward secrecy (PFS)
- Future secrecy (post-compromise security)
- Deniability

However, it requires:
1. **Persistent device state** — each device maintains a ratchet state.
   WebWaka targets feature phones + web browsers with no native app yet.
2. **Pre-key bundles** — server must store signed pre-keys per user device.
   Adds significant infrastructure (key distribution server, device management).
3. **Session resumption** — difficult across multiple devices / browser tabs.
4. **Group message complexity** — Sender Keys protocol on top of Signal.

Implementing Signal Protocol correctly is a 3–6 month engineering effort
and requires native apps for a good UX. A partial implementation would be
worse than server-side encryption (false sense of security).

### Practical E2EE path for WebWaka

We adopt a **two-phase strategy**:

**Phase 1 (short term)**: Hybrid encryption using recipient's public key.
- Uses Web Crypto API (ECDH + AES-GCM) — works in all modern browsers.
- Server stores ciphertext only; cannot decrypt.
- No PFS, but server-side compromise does not reveal past messages.
- Simpler key management: one keypair per user (not per device/session).

**Phase 2 (long term, when native app ships)**: Signal Protocol / MLS.
- Triggered when native iOS/Android app is built.
- Migrate encrypted content to Signal-encrypted format.
- Clients migrate their keypairs; old messages remain in Phase 1 format.

---

## Decision: Phase 1 — Hybrid ECDH/AES-GCM E2EE

### Protocol

1. **Key generation** (client-side, at registration or first DM):
   ```
   const keyPair = await crypto.subtle.generateKey(
     { name: 'ECDH', namedCurve: 'P-256' },
     true,
     ['deriveKey']
   );
   ```

2. **Public key publication** (client → server):
   - Client sends `publicKey` (JWK format) to `PATCH /profile/e2e-pubkey`.
   - Server stores in `profiles.e2e_public_key` (TEXT, JWK JSON).
   - Private key stays on the client (localStorage / IndexedDB, encrypted with user password).

3. **Message send** (sender's browser):
   ```
   // Sender fetches recipient's public key
   GET /profile/{recipientId}/e2e-pubkey → { publicKey: JWK }

   // Derive shared secret via ECDH
   const sharedKey = await crypto.subtle.deriveKey(
     { name: 'ECDH', public: recipientPublicKey },
     senderEphemeralPrivateKey,
     { name: 'AES-GCM', length: 256 },
     false, ['encrypt']
   );

   // Encrypt content
   const { ciphertext, iv } = await aesgcmEncrypt(plaintext, sharedKey);

   // Send to server (cannot be decrypted server-side)
   POST /dm  { recipientId, ciphertext, iv, senderEphemeralPublicKey }
   ```

4. **Message receive** (recipient's browser):
   ```
   // Derive same shared secret
   const sharedKey = await crypto.subtle.deriveKey(
     { name: 'ECDH', public: senderEphemeralPublicKey },
     recipientPrivateKey,
     { name: 'AES-GCM', length: 256 },
     false, ['decrypt']
   );
   const plaintext = await aesgcmDecrypt(ciphertext, iv, sharedKey);
   ```

### What changes on the server

| Component | Change |
|-----------|--------|
| `profiles` table | Add `e2e_public_key TEXT` column |
| `PATCH /profile/e2e-pubkey` | New endpoint — validates JWK format, stores public key |
| `GET /profile/:id/e2e-pubkey` | New endpoint — returns public key (authenticated, tenant-scoped) |
| `POST /dm` | Accept `ciphertext + iv + senderEphemeralPublicKey` instead of `content` |
| `GET /dm/:id` | Return raw ciphertext + iv + senderEphemeralPublicKey |
| `packages/social/src/dm.ts` | Remove `encryptDMContent` / `decryptDMContent`; validate ciphertext format |

### Key storage on the client

Private keys are stored in **IndexedDB** via the Web Crypto API's
`exportKey` (wrapped with a key derived from the user's password using PBKDF2).
This is the same pattern used by Bitwarden and 1Password web vaults.

```
userPassword  →  PBKDF2(100_000 iterations, SHA-256)  →  wrappingKey
                                                          ↓
                                           exportKey(privateKey, wrappingKey)
                                                          ↓
                                                   IndexedDB: {
                                                     wrappedPrivateKey,
                                                     publicKey (JWK),
                                                     salt
                                                   }
```

### Threat model

| Threat | Mitigated? |
|--------|-----------|
| Server compromise | ✅ Ciphertext only; server cannot decrypt |
| D1 database dump | ✅ Only ciphertext stored |
| Network interception | ✅ HTTPS + ciphertext |
| Client device compromise | ⚠️ Private key on device; attacker with device access can read DMs |
| Key loss (forgotten password) | ⚠️ No recovery without backup phrase |
| No PFS | ⚠️ Phase 1 limitation; if private key is compromised, all past DMs exposed |

PFS and post-compromise security are Phase 2 goals.

---

## Migration Plan: P14 → E2EE

### Staged migration (zero downtime)

#### Stage 0 — Dual-mode support (deploy first)
- Server accepts BOTH old format (`content` plaintext/encrypted with master key)
  and new format (`ciphertext`, `iv`, `senderEphemeralPublicKey`).
- Determined by presence of `senderEphemeralPublicKey` field.
- All new messages from E2EE clients use new format.

#### Stage 1 — Client rollout (4–8 weeks)
- Ship updated web client with E2EE key generation.
- Users prompted to generate keypair on first login after update.
- Users without a keypair still send via P14 server-side encryption.

#### Stage 2 — Re-encryption window (opt-in, 30 days)
- Users with keypairs can request re-encryption of their conversation history.
- Server decrypts old messages with `DM_MASTER_KEY`, re-encrypts with recipient
  public key, stores both versions for 30-day rollback window.

#### Stage 3 — P14 mode removal (after Stage 2 complete)
- Remove `DM_MASTER_KEY` usage from server-side DM code.
- Mark P14 governance rule as superseded by E2EE.
- Old DM records (P14 format) remain readable only if client stores the
  re-encryption result locally.

### Database schema changes

```sql
-- Stage 0: add new columns alongside existing
ALTER TABLE dms ADD COLUMN ciphertext_v2 TEXT;
ALTER TABLE dms ADD COLUMN iv_v2 TEXT;
ALTER TABLE dms ADD COLUMN sender_ephemeral_pubkey TEXT;
ALTER TABLE dms ADD COLUMN encryption_version INTEGER DEFAULT 1;
-- encryption_version: 1 = P14 server-side, 2 = E2EE Phase 1

-- profiles: public key storage
ALTER TABLE profiles ADD COLUMN e2e_public_key TEXT;
ALTER TABLE profiles ADD COLUMN e2e_pubkey_updated_at INTEGER;
```

### Timeline estimate

| Stage | Duration | Prerequisite |
|-------|----------|--------------|
| 0: Dual-mode server | 1 sprint | This ADR approved |
| 1: Web client rollout | 2 sprints | Stage 0 deployed |
| 2: Re-encryption | 2 sprints | ≥80% users have keypairs |
| 3: P14 removal | 1 sprint | 30-day re-encryption window complete |

**Total estimated timeline**: ~3 months

---

## Alternatives Considered

| Option | Decision |
|--------|----------|
| Full Signal Protocol now | Rejected — requires native app, 3-6 month effort |
| libsodium (NaCl) | Considered; not available in Web Crypto API. Would need WASM bundle (200KB+). ECDH/AES-GCM achieves same security with 0 extra JS. |
| MLS (Messaging Layer Security, RFC 9420) | Future Phase 3 when group E2EE and multi-device are needed |
| Keep P14 only | Rejected — server-held key is a single point of compromise |

---

## Consequences

**Positive**
- True E2EE: server cannot read DMs after Phase 1.
- No new dependencies (Web Crypto API is built into all browsers).
- Gradual migration: no flag day, no data loss.

**Negative / Risks**
- No PFS until Phase 2 (Signal Protocol).
- Key loss = permanent message loss (no server-side recovery).
- Moderation becomes impossible for E2EE messages (by design).
- Multi-device sync requires key export/import UX (planned for Phase 1.5).

---

## Acceptance Criteria

- [x] Design ADR committed to `docs/adr/`
- [x] Migration plan documented (Stages 0–3)
- [x] Database schema changes specified
- [x] Threat model documented
- [ ] Stage 0 server implementation (future sprint)
- [ ] Web client key generation UI (future sprint)
