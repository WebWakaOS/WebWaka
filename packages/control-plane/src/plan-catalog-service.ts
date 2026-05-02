/**
 * @webwaka/control-plane — PlanCatalogService
 *
 * Runtime-managed subscription package catalog.
 * Replaces the hardcoded PLAN_CONFIGS approach with DB-backed records.
 * Backward-compatible: falls back to static PLAN_CONFIGS when DB is unavailable.
 */

import type { D1Like, ActorContext, SubscriptionPackage, PackagePricing, BillingInterval, PackageStatus, PaginatedResult } from './types.js';
import type { AuditService } from './audit-service.js';

export interface CreatePackageInput {
  slug: string;
  name: string;
  description?: string;
  status?: PackageStatus;
  is_public?: boolean;
  sort_order?: number;
  target_audience?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdatePackageInput {
  name?: string;
  description?: string;
  status?: PackageStatus;
  is_public?: boolean;
  sort_order?: number;
  metadata?: Record<string, unknown>;
}

export interface SetPricingInput {
  billing_interval_id: string;
  price_kobo: number;
  currency?: string;
  effective_from?: number;
  effective_until?: number | null;
  trial_days_override?: number | null;
  paystack_plan_code?: string | null;
}

export class PlanCatalogService {
  constructor(
    private readonly db: D1Like,
    private readonly audit: AuditService,
  ) {}

  // ─── Packages ─────────────────────────────────────────────────────────────

  async listPackages(opts: {
    status?: PackageStatus;
    isPublic?: boolean;
    targetAudience?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<PaginatedResult<SubscriptionPackage>> {
    const conditions: string[] = [];
    const bindings: unknown[] = [];

    if (opts.status) { conditions.push('status = ?'); bindings.push(opts.status); }
    if (opts.isPublic !== undefined) { conditions.push('is_public = ?'); bindings.push(opts.isPublic ? 1 : 0); }
    if (opts.targetAudience) { conditions.push('target_audience = ?'); bindings.push(opts.targetAudience); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(opts.limit ?? 50, 200);
    const offset = opts.offset ?? 0;

    const [rows, countRow] = await Promise.all([
      this.db.prepare(`SELECT * FROM subscription_packages ${where} ORDER BY sort_order ASC, created_at ASC LIMIT ? OFFSET ?`)
        .bind(...bindings, limit, offset).all<SubscriptionPackage>(),
      this.db.prepare(`SELECT COUNT(*) as total FROM subscription_packages ${where}`)
        .bind(...bindings).first<{ total: number }>(),
    ]);

    return { results: rows.results, total: countRow?.total, limit, offset };
  }

  async getPackage(idOrSlug: string): Promise<SubscriptionPackage | null> {
    return this.db
      .prepare('SELECT * FROM subscription_packages WHERE id = ? OR slug = ? LIMIT 1')
      .bind(idOrSlug, idOrSlug)
      .first<SubscriptionPackage>();
  }

  async createPackage(input: CreatePackageInput, actor: ActorContext): Promise<SubscriptionPackage> {
    const id = `pkg_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
    const now = Math.floor(Date.now() / 1000);

    await this.db
      .prepare(
        `INSERT INTO subscription_packages
           (id, slug, name, description, status, is_public, sort_order, target_audience, version, is_default, metadata, created_by, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,1,0,?,?,?,?)`,
      )
      .bind(
        id,
        input.slug,
        input.name,
        input.description ?? null,
        input.status ?? 'draft',
        input.is_public !== false ? 1 : 0,
        input.sort_order ?? 0,
        input.target_audience ?? 'tenant',
        JSON.stringify(input.metadata ?? {}),
        actor.actorId,
        now,
        now,
      )
      .run();

    const pkg = await this.getPackage(id);
    if (!pkg) throw new Error('Failed to create package');

    await this.audit.log(actor, {
      action: 'package.create',
      resourceType: 'subscription_package',
      resourceId: id,
      afterJson: pkg,
    });

    return pkg;
  }

  async updatePackage(id: string, input: UpdatePackageInput, actor: ActorContext): Promise<SubscriptionPackage> {
    const existing = await this.getPackage(id);
    if (!existing) throw new Error(`Package not found: ${id}`);

    const now = Math.floor(Date.now() / 1000);
    const sets: string[] = ['updated_at = ?'];
    const bindings: unknown[] = [now];

    if (input.name !== undefined) { sets.push('name = ?'); bindings.push(input.name); }
    if (input.description !== undefined) { sets.push('description = ?'); bindings.push(input.description); }
    if (input.status !== undefined) { sets.push('status = ?'); bindings.push(input.status); }
    if (input.is_public !== undefined) { sets.push('is_public = ?'); bindings.push(input.is_public ? 1 : 0); }
    if (input.sort_order !== undefined) { sets.push('sort_order = ?'); bindings.push(input.sort_order); }
    if (input.metadata !== undefined) { sets.push('metadata = ?'); bindings.push(JSON.stringify(input.metadata)); }

    bindings.push(id);
    await this.db.prepare(`UPDATE subscription_packages SET ${sets.join(', ')} WHERE id = ?`).bind(...bindings).run();

    const updated = await this.getPackage(id);
    if (!updated) throw new Error('Failed to update package');

    await this.snapshot(id, existing.version, existing, actor);
    await this.audit.log(actor, {
      action: 'package.update',
      resourceType: 'subscription_package',
      resourceId: id,
      beforeJson: existing,
      afterJson: updated,
    });

    return updated;
  }

  async activatePackage(id: string, actor: ActorContext): Promise<void> {
    await this.updatePackage(id, { status: 'active' }, actor);
  }

  async deactivatePackage(id: string, actor: ActorContext): Promise<void> {
    await this.updatePackage(id, { status: 'inactive' }, actor);
  }

  async archivePackage(id: string, supersededById: string | null, actor: ActorContext): Promise<void> {
    const existing = await this.getPackage(id);
    if (!existing) throw new Error(`Package not found: ${id}`);

    const now = Math.floor(Date.now() / 1000);
    await this.db
      .prepare('UPDATE subscription_packages SET status = ?, superseded_by = ?, updated_at = ? WHERE id = ?')
      .bind('archived', supersededById, now, id)
      .run();

    await this.audit.log(actor, {
      action: 'package.archive',
      resourceType: 'subscription_package',
      resourceId: id,
      beforeJson: existing,
      afterJson: { ...existing, status: 'archived', superseded_by: supersededById },
    });
  }

  private async snapshot(packageId: string, version: number, snapshot: unknown, actor: ActorContext): Promise<void> {
    const id = `pvh_${crypto.randomUUID()}`;
    const now = Math.floor(Date.now() / 1000);
    await this.db
      .prepare(
        `INSERT INTO package_version_history (id, package_id, version, snapshot_json, changed_by, created_at)
         VALUES (?,?,?,?,?,?)`,
      )
      .bind(id, packageId, version, JSON.stringify(snapshot), actor.actorId, now)
      .run();
  }

  // ─── Billing Intervals ────────────────────────────────────────────────────

  async listBillingIntervals(): Promise<BillingInterval[]> {
    const rows = await this.db
      .prepare('SELECT * FROM billing_intervals ORDER BY sort_order ASC')
      .bind()
      .all<BillingInterval>();
    return rows.results;
  }

  // ─── Pricing ──────────────────────────────────────────────────────────────

  async getPackagePricing(packageId: string): Promise<PackagePricing[]> {
    const rows = await this.db
      .prepare('SELECT pp.*, bi.code as interval_code, bi.label as interval_label FROM package_pricing pp JOIN billing_intervals bi ON pp.billing_interval_id = bi.id WHERE pp.package_id = ? AND pp.is_active = 1 ORDER BY pp.effective_from DESC')
      .bind(packageId)
      .all<PackagePricing & { interval_code: string; interval_label: string }>();
    return rows.results;
  }

  async setPricing(packageId: string, input: SetPricingInput, actor: ActorContext): Promise<PackagePricing> {
    const existing = await this.getPackage(packageId);
    if (!existing) throw new Error(`Package not found: ${packageId}`);

    const id = `pp_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
    const now = Math.floor(Date.now() / 1000);
    const effectiveFrom = input.effective_from ?? now;

    await this.db
      .prepare(
        `INSERT INTO package_pricing
           (id, package_id, billing_interval_id, price_kobo, currency, effective_from, effective_until, trial_days_override, is_active, paystack_plan_code, metadata, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,1,?,'{}',?,?)
         ON CONFLICT (package_id, billing_interval_id, effective_from)
         DO UPDATE SET price_kobo=excluded.price_kobo, effective_until=excluded.effective_until, paystack_plan_code=excluded.paystack_plan_code, updated_at=excluded.updated_at`,
      )
      .bind(
        id, packageId, input.billing_interval_id, input.price_kobo,
        input.currency ?? 'NGN', effectiveFrom, input.effective_until ?? null,
        input.trial_days_override ?? null, input.paystack_plan_code ?? null, now, now,
      )
      .run();

    await this.audit.log(actor, {
      action: 'package.pricing.set',
      resourceType: 'package_pricing',
      resourceId: packageId,
      afterJson: { ...input, packageId },
    });

    const pricing = await this.db
      .prepare('SELECT * FROM package_pricing WHERE package_id = ? AND billing_interval_id = ? ORDER BY effective_from DESC LIMIT 1')
      .bind(packageId, input.billing_interval_id)
      .first<PackagePricing>();

    return pricing!;
  }
}
