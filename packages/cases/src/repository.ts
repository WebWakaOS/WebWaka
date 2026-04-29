/**
 * @webwaka/cases — D1 Repository (Phase 1)
 *
 * All queries:
 *   - T3: include tenant_id filter on every SELECT/UPDATE
 *   - P10: ndprConsented checked before create
 *   - Append-only notes (no UPDATE/DELETE on case_notes)
 */

import type {
  Case,
  CaseNote,
  CreateCaseInput,
  AssignCaseInput,
  AddNoteInput,
  ResolveCaseInput,
  CloseCaseInput,
  ReopenCaseInput,
  ListCasesInput,
  CaseSummary,
} from './types.js';

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      first<T>(): Promise<T | null>;
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

type CaseRow = {
  id: string; tenant_id: string; workspace_id: string;
  title: string; description: string | null; status: string; priority: string;
  category: string; source_channel: string; group_id: string | null;
  reported_by_user_id: string | null; assigned_to_user_id: string | null;
  assigned_at: number | null; resolved_at: number | null; closed_at: number | null;
  sla_due_at: number | null; ndpr_consented: number;
  tags: string; metadata_json: string; created_at: number; updated_at: number;
};

type NoteRow = {
  id: string; case_id: string; tenant_id: string; author_id: string;
  note_type: string; body: string; is_internal: number;
  metadata_json: string; created_at: number;
};

function rowToCase(r: CaseRow): Case {
  return {
    id: r.id, tenantId: r.tenant_id, workspaceId: r.workspace_id,
    title: r.title, description: r.description, status: r.status as Case['status'],
    priority: r.priority as Case['priority'], category: r.category as Case['category'],
    sourceChannel: r.source_channel as Case['sourceChannel'],
    groupId: r.group_id, reportedByUserId: r.reported_by_user_id,
    assignedToUserId: r.assigned_to_user_id, assignedAt: r.assigned_at,
    resolvedAt: r.resolved_at, closedAt: r.closed_at, slaDueAt: r.sla_due_at,
    ndprConsented: r.ndpr_consented === 1,
    tags: JSON.parse(r.tags) as string[],
    metadataJson: JSON.parse(r.metadata_json) as Record<string, unknown>,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function rowToNote(r: NoteRow): CaseNote {
  return {
    id: r.id, caseId: r.case_id, tenantId: r.tenant_id,
    authorId: r.author_id, noteType: r.note_type as CaseNote['noteType'],
    body: r.body, isInternal: r.is_internal === 1,
    metadataJson: JSON.parse(r.metadata_json) as Record<string, unknown>,
    createdAt: r.created_at,
  };
}

/**
 * Create a new case. P10: ndprConsented must be true.
 */
export async function createCase(db: D1Like, input: CreateCaseInput): Promise<Case> {
  if (!input.ndprConsented) {
    throw new Error('NDPR_REQUIRED: ndprConsented must be true to create a case containing personal data.');
  }

  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(`
      INSERT INTO cases
        (id, tenant_id, workspace_id, title, description, status, priority, category,
         source_channel, group_id, reported_by_user_id, sla_due_at, ndpr_consented,
         tags, metadata_json, created_at, updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `)
    .bind(
      id, input.tenantId, input.workspaceId, input.title,
      input.description ?? null, 'open',
      input.priority ?? 'normal', input.category ?? 'general',
      input.sourceChannel ?? 'web', input.groupId ?? null,
      input.reportedByUserId ?? null, input.slaDueAt ?? null,
      input.ndprConsented ? 1 : 0,
      JSON.stringify(input.tags ?? []),
      JSON.stringify(input.metadataJson ?? {}),
      now, now,
    )
    .run();

  return getCase(db, id, input.tenantId) as Promise<Case>;
}

/**
 * Get a single case by ID + tenantId (T3).
 */
export async function getCase(db: D1Like, id: string, tenantId: string): Promise<Case | null> {
  const row = await db
    .prepare('SELECT * FROM cases WHERE id = ? AND tenant_id = ?')
    .bind(id, tenantId)
    .first<CaseRow>();
  return row ? rowToCase(row) : null;
}

/**
 * List cases with optional filters. T3: tenantId always required.
 */
export async function listCases(db: D1Like, input: ListCasesInput): Promise<Case[]> {
  const limit = Math.min(input.limit ?? 50, 200);
  const offset = input.offset ?? 0;

  const conditions: string[] = ['tenant_id = ?'];
  const binds: unknown[] = [input.tenantId];

  if (input.workspaceId) { conditions.push('workspace_id = ?'); binds.push(input.workspaceId); }
  if (input.status)      { conditions.push('status = ?');       binds.push(input.status); }
  if (input.priority)    { conditions.push('priority = ?');     binds.push(input.priority); }
  if (input.assignedToUserId) { conditions.push('assigned_to_user_id = ?'); binds.push(input.assignedToUserId); }
  if (input.groupId)     { conditions.push('group_id = ?');     binds.push(input.groupId); }

  binds.push(limit, offset);

  const { results } = await db
    .prepare(`SELECT * FROM cases WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .bind(...binds)
    .all<CaseRow>();

  return results.map(rowToCase);
}

/**
 * Assign a case to an agent. Adds a system note.
 */
export async function assignCase(db: D1Like, input: AssignCaseInput): Promise<Case> {
  const now = Math.floor(Date.now() / 1000);

  const res = await db
    .prepare(`
      UPDATE cases SET
        assigned_to_user_id = ?, assigned_at = ?, status = 'assigned', updated_at = ?
      WHERE id = ? AND tenant_id = ?
    `)
    .bind(input.assignedToUserId, now, now, input.caseId, input.tenantId)
    .run();

  if (!res.meta?.changes || res.meta.changes === 0) {
    throw new Error('CASE_NOT_FOUND: Case not found or already closed.');
  }

  await addNote(db, {
    caseId: input.caseId, tenantId: input.tenantId,
    authorId: input.assignedByUserId,
    body: `Case assigned to user ${input.assignedToUserId}`,
    noteType: 'assignment', isInternal: true,
  });

  return getCase(db, input.caseId, input.tenantId) as Promise<Case>;
}

/**
 * Add a note to a case. Append-only — no UPDATE/DELETE ever.
 */
export async function addNote(db: D1Like, input: AddNoteInput): Promise<CaseNote> {
  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(`
      INSERT INTO case_notes
        (id, case_id, tenant_id, author_id, note_type, body, is_internal, metadata_json, created_at)
      VALUES (?,?,?,?,?,?,?,?,?)
    `)
    .bind(
      id, input.caseId, input.tenantId, input.authorId,
      input.noteType ?? 'comment', input.body,
      input.isInternal ? 1 : 0,
      JSON.stringify(input.metadataJson ?? {}),
      now,
    )
    .run();

  // Update case updated_at
  await db
    .prepare('UPDATE cases SET updated_at = ? WHERE id = ? AND tenant_id = ?')
    .bind(now, input.caseId, input.tenantId)
    .run();

  const row = await db
    .prepare('SELECT * FROM case_notes WHERE id = ?')
    .bind(id)
    .first<NoteRow>();

  return rowToNote(row!);
}

/**
 * List notes for a case. T3: tenantId filter included.
 */
export async function listNotes(
  db: D1Like,
  caseId: string,
  tenantId: string,
  includeInternal = false,
): Promise<CaseNote[]> {
  const { results } = await db
    .prepare(`
      SELECT * FROM case_notes
      WHERE case_id = ? AND tenant_id = ?
      ${!includeInternal ? "AND is_internal = 0" : ""}
      ORDER BY created_at ASC
    `)
    .bind(caseId, tenantId)
    .all<NoteRow>();
  return results.map(rowToNote);
}

/**
 * Resolve a case. Adds a resolution note and sets resolved_at.
 */
export async function resolveCase(db: D1Like, input: ResolveCaseInput): Promise<Case> {
  const now = Math.floor(Date.now() / 1000);

  const res = await db
    .prepare(`
      UPDATE cases SET status = 'resolved', resolved_at = ?, updated_at = ?
      WHERE id = ? AND tenant_id = ? AND status NOT IN ('resolved','closed')
    `)
    .bind(now, now, input.caseId, input.tenantId)
    .run();

  if (!res.meta?.changes || res.meta.changes === 0) {
    throw new Error('CASE_NOT_FOUND: Case not found, or already resolved/closed.');
  }

  await addNote(db, {
    caseId: input.caseId, tenantId: input.tenantId,
    authorId: input.resolvedByUserId,
    body: input.resolutionNote,
    noteType: 'resolution', isInternal: false,
  });

  return getCase(db, input.caseId, input.tenantId) as Promise<Case>;
}

/**
 * Close a resolved case.
 */
export async function closeCase(db: D1Like, input: CloseCaseInput): Promise<Case> {
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(`
      UPDATE cases SET status = 'closed', closed_at = ?, updated_at = ?
      WHERE id = ? AND tenant_id = ?
    `)
    .bind(now, now, input.caseId, input.tenantId)
    .run();

  await addNote(db, {
    caseId: input.caseId, tenantId: input.tenantId,
    authorId: input.closedByUserId,
    body: 'Case closed.',
    noteType: 'system', isInternal: true,
  });

  return getCase(db, input.caseId, input.tenantId) as Promise<Case>;
}

/**
 * Reopen a closed or resolved case.
 */
export async function reopenCase(db: D1Like, input: ReopenCaseInput): Promise<Case> {
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(`
      UPDATE cases SET status = 'reopened', resolved_at = NULL, closed_at = NULL, updated_at = ?
      WHERE id = ? AND tenant_id = ? AND status IN ('resolved','closed')
    `)
    .bind(now, input.caseId, input.tenantId)
    .run();

  await addNote(db, {
    caseId: input.caseId, tenantId: input.tenantId,
    authorId: input.reopenedByUserId,
    body: input.reason,
    noteType: 'status_change', isInternal: false,
  });

  return getCase(db, input.caseId, input.tenantId) as Promise<Case>;
}

/**
 * Summary statistics for a workspace. Used for dashboard widgets.
 */
export async function getCaseSummary(
  db: D1Like,
  tenantId: string,
  workspaceId: string,
): Promise<CaseSummary> {
  const now = Math.floor(Date.now() / 1000);

  const openRow = await db
    .prepare(`SELECT COUNT(*) as c FROM cases WHERE tenant_id = ? AND workspace_id = ? AND status = 'open'`)
    .bind(tenantId, workspaceId)
    .first<{ c: number }>();

  const assignedRow = await db
    .prepare(`SELECT COUNT(*) as c FROM cases WHERE tenant_id = ? AND workspace_id = ? AND status IN ('assigned','in_progress')`)
    .bind(tenantId, workspaceId)
    .first<{ c: number }>();

  const resolvedRow = await db
    .prepare(`SELECT COUNT(*) as c FROM cases WHERE tenant_id = ? AND workspace_id = ? AND status = 'resolved'`)
    .bind(tenantId, workspaceId)
    .first<{ c: number }>();

  const breachRow = await db
    .prepare(`SELECT COUNT(*) as c FROM cases WHERE tenant_id = ? AND workspace_id = ? AND sla_due_at < ? AND status NOT IN ('resolved','closed')`)
    .bind(tenantId, workspaceId, now)
    .first<{ c: number }>();

  const avgRow = await db
    .prepare(`SELECT AVG(resolved_at - created_at) as avg FROM cases WHERE tenant_id = ? AND workspace_id = ? AND resolved_at IS NOT NULL`)
    .bind(tenantId, workspaceId)
    .first<{ avg: number | null }>();

  return {
    totalOpen: openRow?.c ?? 0,
    totalAssigned: assignedRow?.c ?? 0,
    totalResolved: resolvedRow?.c ?? 0,
    breachingSla: breachRow?.c ?? 0,
    avgResolutionSeconds: avgRow?.avg ?? null,
  };
}
