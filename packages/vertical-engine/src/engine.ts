/**
 * @webwaka/vertical-engine — Engine Orchestrator
 *
 * High-level facade that combines FSM, CRUD, and AI config
 * for a given VerticalConfig.
 */

import type { VerticalConfig, SubEntityDef } from './schema.js';
import { VerticalCRUD } from './crud.js';
import { FSMEngine } from './fsm.js';

interface D1Like {
  prepare(s: string): {
    bind(...v: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

/**
 * VerticalEngine — configuration-driven vertical runtime.
 *
 * Usage:
 *   const engine = new VerticalEngine(bakeryConfig, db);
 *   const profile = await engine.createProfile({ bakeryName: 'Mama Joy' }, 'tnt_1', 'ws_1');
 *   await engine.advanceState(profile.id, 'tnt_1', 'claimed');
 */
export class VerticalEngine {
  readonly slug: string;
  readonly config: VerticalConfig;
  readonly crud: VerticalCRUD;
  readonly fsm: FSMEngine;

  constructor(config: VerticalConfig, db: D1Like) {
    this.slug = config.slug;
    this.config = config;
    this.crud = new VerticalCRUD(config, db);
    this.fsm = new FSMEngine(config.fsm);
  }

  // -------------------------------------------------------------------------
  // Profile operations (delegates to CRUD)
  // -------------------------------------------------------------------------

  async createProfile(
    input: Record<string, unknown>,
    tenantId: string,
    workspaceId: string,
  ): Promise<Record<string, unknown>> {
    return this.crud.createProfile(input, tenantId, workspaceId);
  }

  async findById(id: string, tenantId: string): Promise<Record<string, unknown> | null> {
    return this.crud.findById(id, tenantId);
  }

  async findByWorkspace(workspaceId: string, tenantId: string): Promise<Record<string, unknown> | null> {
    return this.crud.findByWorkspace(workspaceId, tenantId);
  }

  async listByTenant(tenantId: string, limit?: number, offset?: number): Promise<Record<string, unknown>[]> {
    return this.crud.listByTenant(tenantId, limit, offset);
  }

  async updateProfile(
    id: string,
    tenantId: string,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown> | null> {
    return this.crud.updateProfile(id, tenantId, input);
  }

  async advanceState(
    id: string,
    tenantId: string,
    targetState: string,
  ): Promise<{ success: boolean; profile?: Record<string, unknown> | undefined; reason?: string | undefined }> {
    return this.crud.advanceState(id, tenantId, targetState);
  }

  // -------------------------------------------------------------------------
  // Sub-Entity operations
  // -------------------------------------------------------------------------

  getSubEntity(name: string): SubEntityDef | undefined {
    return this.config.subEntities?.find(e => e.name === name);
  }

  async createSubEntity(
    entityName: string,
    profileId: string,
    tenantId: string,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const def = this.getSubEntity(entityName);
    if (!def) throw new Error(`Sub-entity '${entityName}' not found in ${this.slug}`);
    return this.crud.createSubEntity(def, profileId, tenantId, input);
  }

  async listSubEntities(
    entityName: string,
    profileId: string,
    tenantId: string,
  ): Promise<Record<string, unknown>[]> {
    const def = this.getSubEntity(entityName);
    if (!def) throw new Error(`Sub-entity '${entityName}' not found in ${this.slug}`);
    return this.crud.listSubEntities(def, profileId, tenantId);
  }

  // -------------------------------------------------------------------------
  // AI helpers
  // -------------------------------------------------------------------------

  /**
   * Get fields that are safe to include in AI context (excludes PII per P13).
   */
  getAISafeProjection(): string[] {
    return this.crud.getAISafeFields().map(f => f.property);
  }

  /**
   * Whether this vertical allows a specific AI capability.
   */
  isCapabilityAllowed(capability: string): boolean {
    if (this.config.ai.prohibitedCapabilities?.includes(capability as never)) return false;
    return this.config.ai.allowedCapabilities.includes(capability as never);
  }

  /**
   * Whether HITL is required for a specific capability.
   */
  requiresHitl(capability: string): boolean {
    if (this.config.ai.hitlMandatoryAll) return true;
    return this.config.ai.hitlRequired?.includes(capability as never) ?? false;
  }
}
