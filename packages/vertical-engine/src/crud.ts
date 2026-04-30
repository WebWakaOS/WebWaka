/**
 * @webwaka/vertical-engine — Generic CRUD Operations
 *
 * Schema-driven D1 CRUD generator. Given a VerticalConfig, produces
 * type-safe create/read/update/list/archive operations.
 *
 * Platform Invariants enforced:
 *   T3: Every query includes tenant_id
 *   P9: Kobo fields validated as integers
 *   P13: PII fields are never included in AI-visible projections
 */

import type { VerticalConfig, FieldDef, SubEntityDef } from './schema.js';
import { FSMEngine } from './fsm.js';

// ---------------------------------------------------------------------------
// D1-compatible interface (matches Cloudflare Workers D1Database)
// ---------------------------------------------------------------------------

interface D1Stmt {
  bind(...values: unknown[]): D1BoundStmt;
}
interface D1BoundStmt {
  run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
}
interface D1Like {
  prepare(sql: string): D1Stmt;
}

// ---------------------------------------------------------------------------
// Type mapping utilities
// ---------------------------------------------------------------------------

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

function rowToEntity(row: Record<string, unknown>, fields: readonly FieldDef[]): Record<string, unknown> {
  const entity: Record<string, unknown> = {
    id: row['id'],
    workspaceId: row['workspace_id'],
    tenantId: row['tenant_id'],
    status: row['status'],
    createdAt: row['created_at'],
    updatedAt: row['updated_at'],
  };
  for (const field of fields) {
    entity[field.property] = row[field.column] ?? null;
  }
  return entity;
}

// ---------------------------------------------------------------------------
// VerticalCRUD — Main class
// ---------------------------------------------------------------------------

/**
 * VerticalCRUD generates and executes D1 operations for a vertical
 * based on its configuration.
 */
export class VerticalCRUD {
  readonly slug: string;
  readonly tableName: string;
  readonly fsm: FSMEngine;
  private readonly fields: readonly FieldDef[];
  private readonly createFieldNames: readonly string[];
  private readonly updateFieldNames: readonly string[];

  constructor(
    private readonly config: VerticalConfig,
    private readonly db: D1Like,
  ) {
    this.slug = config.slug;
    this.tableName = config.tableName;
    this.fields = config.profileFields;
    this.createFieldNames = config.createFields;
    this.updateFieldNames = config.updateFields;
    this.fsm = new FSMEngine(config.fsm);
  }

  // -------------------------------------------------------------------------
  // Profile CRUD
  // -------------------------------------------------------------------------

  /**
   * Create a new profile with initial FSM state.
   * T3: tenantId is mandatory.
   * P9: All kobo fields are validated as integers.
   */
  async createProfile(
    input: Record<string, unknown>,
    tenantId: string,
    workspaceId: string,
  ): Promise<Record<string, unknown>> {
    // Validate P9 kobo fields
    for (const field of this.fields) {
      if (field.isKobo && input[field.property] !== undefined) {
        const val = input[field.property];
        if (typeof val !== 'number' || !Number.isInteger(val)) {
          throw new Error(`${field.property} must be an integer (P9: kobo integers only)`);
        }
      }
    }

    const id = (input['id'] as string) ?? crypto.randomUUID();
    const initialState = this.fsm.initialState;

    // Build column list and values
    const columns = ['id', 'workspace_id', 'tenant_id', 'status', 'created_at', 'updated_at'];
    const placeholders = ['?', '?', '?', '?', 'unixepoch()', 'unixepoch()'];
    const values: unknown[] = [id, workspaceId, tenantId, initialState];

    for (const fieldName of this.createFieldNames) {
      const field = this.fields.find(f => f.property === fieldName);
      if (!field) continue;
      const val = input[field.property];
      if (val !== undefined) {
        columns.push(field.column);
        placeholders.push('?');
        values.push(val);
      } else if (field.required) {
        throw new Error(`Required field ${field.property} is missing`);
      }
    }

    const sql = `INSERT INTO ${this.tableName} (${columns.join(',')}) VALUES (${placeholders.join(',')})`;
    await this.db.prepare(sql).bind(...values).run();

    return this.findById(id, tenantId) as Promise<Record<string, unknown>>;
  }

  /**
   * Find profile by ID. T3: tenant_id enforced.
   */
  async findById(id: string, tenantId: string): Promise<Record<string, unknown> | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE id=? AND tenant_id=?`;
    const row = await this.db.prepare(sql).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToEntity(row, this.fields) : null;
  }

  /**
   * Find profile by workspace. T3: tenant_id enforced.
   */
  async findByWorkspace(workspaceId: string, tenantId: string): Promise<Record<string, unknown> | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE workspace_id=? AND tenant_id=?`;
    const row = await this.db.prepare(sql).bind(workspaceId, tenantId).first<Record<string, unknown>>();
    return row ? rowToEntity(row, this.fields) : null;
  }

  /**
   * List profiles for a workspace. T3: tenant_id enforced.
   */
  async listByTenant(tenantId: string, limit = 100, offset = 0): Promise<Record<string, unknown>[]> {
    const sql = `SELECT * FROM ${this.tableName} WHERE tenant_id=? ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const { results } = await this.db.prepare(sql).bind(tenantId, limit, offset).all<Record<string, unknown>>();
    return results.map(r => rowToEntity(r, this.fields));
  }

  /**
   * Update profile fields. T3: tenant_id enforced.
   * P9: Kobo fields validated.
   */
  async updateProfile(
    id: string,
    tenantId: string,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown> | null> {
    const setClauses: string[] = ['updated_at=unixepoch()'];
    const values: unknown[] = [];

    for (const fieldName of this.updateFieldNames) {
      const field = this.fields.find(f => f.property === fieldName);
      if (!field) continue;
      if (input[field.property] !== undefined) {
        // P9 validation
        if (field.isKobo) {
          const val = input[field.property];
          if (typeof val !== 'number' || !Number.isInteger(val)) {
            throw new Error(`${field.property} must be an integer (P9: kobo integers only)`);
          }
        }
        setClauses.push(`${field.column}=?`);
        values.push(input[field.property]);
      }
    }

    // Allow status update if provided (for admin FSM overrides)
    if (input['status'] !== undefined) {
      setClauses.push('status=?');
      values.push(input['status']);
    }

    if (setClauses.length === 1) {
      // Only updated_at, nothing else changed
      return this.findById(id, tenantId);
    }

    values.push(id, tenantId);
    const sql = `UPDATE ${this.tableName} SET ${setClauses.join(',')} WHERE id=? AND tenant_id=?`;
    await this.db.prepare(sql).bind(...values).run();
    return this.findById(id, tenantId);
  }

  /**
   * Advance FSM state. Validates transition is allowed.
   * T3: tenant_id enforced.
   */
  async advanceState(
    id: string,
    tenantId: string,
    targetState: string,
  ): Promise<{ success: boolean; profile?: Record<string, unknown> | undefined; reason?: string | undefined }> {
    const profile = await this.findById(id, tenantId);
    if (!profile) return { success: false, reason: 'Profile not found' };

    const currentState = profile['status'] as string;
    const validation = this.fsm.validate(currentState, targetState);
    if (!validation.valid) {
      return { success: false, reason: validation.reason ?? 'Transition not allowed' };
    }

    await this.db
      .prepare(`UPDATE ${this.tableName} SET status=?, updated_at=unixepoch() WHERE id=? AND tenant_id=?`)
      .bind(targetState, id, tenantId)
      .run();

    const updated = await this.findById(id, tenantId);
    return { success: true, profile: updated ?? undefined };
  }

  // -------------------------------------------------------------------------
  // Sub-Entity CRUD
  // -------------------------------------------------------------------------

  /**
   * Create a sub-entity record.
   */
  async createSubEntity(
    entityDef: SubEntityDef,
    profileId: string,
    tenantId: string,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const id = (input['id'] as string) ?? crypto.randomUUID();
    const columns = ['id', entityDef.profileForeignKey, 'tenant_id', 'created_at'];
    const placeholders = ['?', '?', '?', 'unixepoch()'];
    const values: unknown[] = [id, profileId, tenantId];

    for (const field of entityDef.fields) {
      if (field.column === 'id' || field.column === entityDef.profileForeignKey || field.column === 'tenant_id' || field.column === 'created_at') continue;
      const val = input[field.property];
      if (val !== undefined) {
        if (field.isKobo && (typeof val !== 'number' || !Number.isInteger(val))) {
          throw new Error(`${field.property} must be an integer (P9)`);
        }
        columns.push(field.column);
        placeholders.push('?');
        values.push(val);
      } else if (field.required) {
        throw new Error(`Required field ${field.property} is missing`);
      }
    }

    const sql = `INSERT INTO ${entityDef.tableName} (${columns.join(',')}) VALUES (${placeholders.join(',')})`;
    await this.db.prepare(sql).bind(...values).run();

    const row = await this.db
      .prepare(`SELECT * FROM ${entityDef.tableName} WHERE id=? AND tenant_id=?`)
      .bind(id, tenantId)
      .first<Record<string, unknown>>();

    if (!row) throw new Error(`Failed to create ${entityDef.name}`);
    return this.subEntityRowToEntity(row, entityDef);
  }

  /**
   * List sub-entities for a profile.
   */
  async listSubEntities(
    entityDef: SubEntityDef,
    profileId: string,
    tenantId: string,
  ): Promise<Record<string, unknown>[]> {
    const sql = `SELECT * FROM ${entityDef.tableName} WHERE ${entityDef.profileForeignKey}=? AND tenant_id=? ORDER BY created_at DESC`;
    const { results } = await this.db.prepare(sql).bind(profileId, tenantId).all<Record<string, unknown>>();
    return results.map(r => this.subEntityRowToEntity(r, entityDef));
  }

  /**
   * Get AI-safe projection (excludes P13 PII fields).
   */
  getAISafeFields(): FieldDef[] {
    return this.fields.filter(f => !f.isPII && f.aiVisible !== false) as FieldDef[];
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private subEntityRowToEntity(row: Record<string, unknown>, def: SubEntityDef): Record<string, unknown> {
    const entity: Record<string, unknown> = {
      id: row['id'],
      tenantId: row['tenant_id'],
      createdAt: row['created_at'],
    };
    entity[snakeToCamel(def.profileForeignKey)] = row[def.profileForeignKey];
    for (const field of def.fields) {
      entity[field.property] = row[field.column] ?? null;
    }
    return entity;
  }
}
