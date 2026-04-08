/**
 * Direct message management.
 * Platform Invariant P14 — DM Content Encrypted at Rest (AES-256-GCM).
 *
 * The DM_MASTER_KEY env var must be present — absence throws at startup, not silently.
 * Content is encrypted before every D1 insert and decrypted on read.
 */

import type { DMThread, DMMessage } from './types.js';
import type { D1Like } from './social-profile.js';
import { encryptContent, decryptContent } from './encryption.js';

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}${Date.now().toString(36)}`;
}

interface ThreadRow {
  id: string;
  type: string;
  participant_ids: string;
  last_message_at: number | null;
  tenant_id: string;
  created_at: number;
}

interface MessageRow {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  media_urls: string;
  is_deleted: number;
  read_by: string;
  tenant_id: string;
  created_at: number;
}

function rowToThread(row: ThreadRow): DMThread {
  return {
    id: row.id,
    type: row.type as DMThread['type'],
    participantIds: JSON.parse(row.participant_ids) as string[],
    lastMessageAt: row.last_message_at,
    tenantId: row.tenant_id,
    createdAt: row.created_at,
  };
}

function rowToMessage(row: MessageRow): DMMessage {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderId: row.sender_id,
    content: row.content, // still encrypted — caller decrypts if needed
    mediaUrls: JSON.parse(row.media_urls) as string[],
    isDeleted: row.is_deleted === 1,
    readBy: JSON.parse(row.read_by) as Record<string, number>,
    tenantId: row.tenant_id,
    createdAt: row.created_at,
  };
}

/**
 * Guard: DM_MASTER_KEY must be present at startup (P14).
 */
export function assertDMMasterKey(masterKey: string | undefined): asserts masterKey is string {
  if (!masterKey || masterKey.trim().length === 0) {
    throw new Error('P14_VIOLATION: DM_MASTER_KEY environment variable is not set. Refusing to start.');
  }
}

/**
 * Create or retrieve a direct thread between two profiles.
 */
export async function getOrCreateThread(
  db: D1Like,
  input: {
    participantIds: string[];
    type?: 'direct' | 'group';
    tenantId: string;
  },
): Promise<DMThread> {
  const sorted = [...input.participantIds].sort();
  const participantJson = JSON.stringify(sorted);

  // For direct threads, check if one already exists
  if ((input.type ?? 'direct') === 'direct' && sorted.length === 2) {
    const { results } = await db
      .prepare(
        `SELECT * FROM dm_threads WHERE type = 'direct' AND tenant_id = ? ORDER BY created_at DESC LIMIT 50`,
      )
      .bind(input.tenantId)
      .all<ThreadRow>();

    for (const row of results) {
      const existing = JSON.parse(row.participant_ids) as string[];
      if (existing.sort().join(',') === sorted.join(',')) {
        return rowToThread(row);
      }
    }
  }

  const id = generateId('dmt');
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      `INSERT INTO dm_threads (id, type, participant_ids, last_message_at, tenant_id, created_at)
       VALUES (?, ?, ?, NULL, ?, ?)`,
    )
    .bind(id, input.type ?? 'direct', participantJson, input.tenantId, now)
    .run();

  return {
    id,
    type: input.type ?? 'direct',
    participantIds: sorted,
    lastMessageAt: null,
    tenantId: input.tenantId,
    createdAt: now,
  };
}

/**
 * List DM threads for a participant.
 */
export async function listThreads(
  db: D1Like,
  participantId: string,
  tenantId: string,
  limit = 20,
): Promise<DMThread[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM dm_threads WHERE tenant_id = ? ORDER BY last_message_at DESC LIMIT ?`,
    )
    .bind(tenantId, limit)
    .all<ThreadRow>();

  // Filter to threads where participant is included
  return results
    .filter((row) => {
      const ids = JSON.parse(row.participant_ids) as string[];
      return ids.includes(participantId);
    })
    .map(rowToThread);
}

/**
 * Send a DM message.
 * P14 — content is encrypted before insert. Plaintext never stored in D1.
 */
export async function sendDM(
  db: D1Like,
  masterKey: string,
  input: {
    threadId: string;
    senderId: string;
    content: string;
    mediaUrls?: string[];
    tenantId: string;
  },
): Promise<DMMessage> {
  assertDMMasterKey(masterKey);

  // P14 — encrypt content before insert
  const encryptedContent = await encryptContent(input.content, masterKey);

  const id = generateId('dmm');
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      `INSERT INTO dm_messages (id, thread_id, sender_id, content, media_urls, is_deleted, read_by, tenant_id, created_at)
       VALUES (?, ?, ?, ?, ?, 0, '{}', ?, ?)`,
    )
    .bind(id, input.threadId, input.senderId, encryptedContent, JSON.stringify(input.mediaUrls ?? []), input.tenantId, now)
    .run();

  await db
    .prepare(`UPDATE dm_threads SET last_message_at = ? WHERE id = ? AND tenant_id = ?`)
    .bind(now, input.threadId, input.tenantId)
    .run();

  return {
    id,
    threadId: input.threadId,
    senderId: input.senderId,
    content: encryptedContent,
    mediaUrls: input.mediaUrls ?? [],
    isDeleted: false,
    readBy: {},
    tenantId: input.tenantId,
    createdAt: now,
  };
}

/**
 * Get messages in a thread (encrypted content — caller must decrypt with masterKey).
 */
export async function getThreadMessages(
  db: D1Like,
  threadId: string,
  tenantId: string,
  limit = 50,
): Promise<DMMessage[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM dm_messages WHERE thread_id = ? AND tenant_id = ? AND is_deleted = 0
       ORDER BY created_at DESC LIMIT ?`,
    )
    .bind(threadId, tenantId, limit)
    .all<MessageRow>();
  return results.map(rowToMessage);
}

/**
 * Decrypt a DM message content.
 */
export async function decryptDMContent(ciphertext: string, masterKey: string): Promise<string> {
  return decryptContent(ciphertext, masterKey);
}
