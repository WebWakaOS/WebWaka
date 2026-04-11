/**
 * D1-backed CRUD for workspaces + memberships.
 * T3: all queries include tenant_id.
 */

import type { Workspace, TenantId, WorkspaceId, UserId } from '@webwaka/types';
import { Role } from '@webwaka/types';
import { generateWorkspaceId } from '../ids.js';

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): { run(): Promise<unknown>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }> };
    run(): Promise<unknown>;
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

export interface CreateWorkspaceInput {
  name: string;
  ownerId: UserId;
  slug?: string;
}

interface WorkspaceRow {
  id: string;
  name: string;
  slug: string | null;
  tenant_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

function rowToWorkspace(row: WorkspaceRow): Workspace {
  return {
    id: row.id as WorkspaceId,
    tenantId: row.tenant_id as TenantId,
    name: row.name,
    slug: row.slug ?? undefined,
    ownerId: row.owner_id as UserId,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as unknown as Workspace;
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export async function createWorkspace(
  db: D1Like,
  tenantId: TenantId,
  input: CreateWorkspaceInput,
): Promise<Workspace> {
  const id = generateWorkspaceId();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO workspaces (id, name, slug, tenant_id, owner_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(id, input.name, input.slug ?? null, tenantId, input.ownerId)
    .run();

  // Auto-create owner membership as admin
  await db
    .prepare(
      `INSERT INTO memberships (id, workspace_id, user_id, role, tenant_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(`mbr_${crypto.randomUUID().replace(/-/g, '')}`, id, input.ownerId, Role.Admin, tenantId)
    .run();

  return {
    id,
    tenantId,
    name: input.name,
    slug: input.slug,
    ownerId: input.ownerId,
    createdAt: now,
    updatedAt: now,
  } as unknown as Workspace;
}

export async function getWorkspaceById(
  db: D1Like,
  tenantId: TenantId,
  id: WorkspaceId,
): Promise<Workspace | null> {
  const row = await db
    .prepare(
      `SELECT id, name, slug, tenant_id, owner_id, datetime(created_at,'unixepoch') AS created_at, datetime(updated_at,'unixepoch') AS updated_at
       FROM workspaces WHERE id = ? AND tenant_id = ?`,
    )
    .bind(id, tenantId)
    .first<WorkspaceRow>();

  return row ? rowToWorkspace(row) : null;
}

export async function addMember(
  db: D1Like,
  tenantId: TenantId,
  workspaceId: WorkspaceId,
  userId: UserId,
  role: Role,
): Promise<void> {
  await db
    .prepare(
      `INSERT OR IGNORE INTO memberships (id, workspace_id, user_id, role, tenant_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(`mbr_${crypto.randomUUID().replace(/-/g, '')}`, workspaceId, userId, role, tenantId)
    .run();
}

export async function removeMember(
  db: D1Like,
  tenantId: TenantId,
  workspaceId: WorkspaceId,
  userId: UserId,
): Promise<void> {
  await db
    .prepare('DELETE FROM memberships WHERE workspace_id = ? AND user_id = ? AND tenant_id = ?')
    .bind(workspaceId, userId, tenantId)
    .run();
}
