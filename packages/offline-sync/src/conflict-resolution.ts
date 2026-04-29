/**
 * Conflict resolution for Phase 3 (E22).
 * Platform Invariant P11: server-wins conflict resolution.
 *
 * When /sync/apply returns 409 (conflict), the local record is replaced by the
 * server-authoritative version. ConflictStore records the conflict for display
 * in the <ww-conflict-notification> component (PRD §11.7).
 *
 * ConflictStore is in-memory per session. It is intentionally not persisted to
 * IndexedDB to avoid accumulating stale conflict records across sessions.
 */

export interface ConflictRecord {
  id: string;               // UUID for this conflict record
  entityType: string;
  entityId: string;
  localVersion: Record<string, unknown>;
  serverVersion: Record<string, unknown>;
  resolvedStrategy: 'server_wins' | 'pending';
  resolvedAt: number | null; // Ms epoch — null if unresolved
  /** Text payload for <ww-conflict-notification> component (PRD §11.7) */
  notificationText: string;
}

function generateConflictId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `conflict_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function buildNotificationText(entityType: string, entityId: string): string {
  return `[WebWaka] Your offline change to ${entityType} (${entityId.slice(0, 8)}) was overwritten by the server version. Tap to review.`;
}

// ---------------------------------------------------------------------------
// ConflictStore — in-memory per-session
// ---------------------------------------------------------------------------

export class ConflictStore {
  private records: Map<string, ConflictRecord> = new Map();

  /**
   * Record a new conflict.
   * Called when POST /sync/apply returns 409.
   * Returns the ConflictRecord for caller to display notification.
   */
  recordConflict(
    entityType: string,
    entityId: string,
    localVersion: Record<string, unknown>,
    serverVersion: Record<string, unknown>,
  ): ConflictRecord {
    const id = generateConflictId();
    const record: ConflictRecord = {
      id,
      entityType,
      entityId,
      localVersion,
      serverVersion,
      resolvedStrategy: 'pending',
      resolvedAt: null,
      notificationText: buildNotificationText(entityType, entityId),
    };
    this.records.set(id, record);
    return record;
  }

  /**
   * Apply server-wins resolution to a conflict.
   * P11: server-wins is the only supported strategy.
   * Returns the updated ConflictRecord.
   * Throws if conflictId is not found.
   */
  resolveServerWins(conflictId: string): ConflictRecord {
    const record = this.records.get(conflictId);
    if (!record) {
      throw new Error(`ConflictStore: conflict '${conflictId}' not found.`);
    }
    const resolved: ConflictRecord = {
      ...record,
      resolvedStrategy: 'server_wins',
      resolvedAt: Date.now(),
    };
    this.records.set(conflictId, resolved);
    return resolved;
  }

  /**
   * Get all unresolved conflicts (resolvedStrategy === 'pending').
   */
  getActiveConflicts(): ConflictRecord[] {
    return Array.from(this.records.values()).filter(r => r.resolvedStrategy === 'pending');
  }

  /**
   * Get all conflicts (including resolved).
   */
  getAllConflicts(): ConflictRecord[] {
    return Array.from(this.records.values());
  }

  /**
   * Clear all records (e.g. on logout).
   */
  clear(): void {
    this.records.clear();
  }
}

/** Singleton conflict store for the app session */
export const conflictStore = new ConflictStore();
