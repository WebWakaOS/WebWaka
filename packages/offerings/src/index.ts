/**
 * @webwaka/offerings — Cross-pillar offerings data access layer.
 *
 * Platform Invariants:
 *   P1 — Build Once (shared offering queries across all three pillars)
 *   P9 — Naira/Kobo (all prices as integer kobo)
 *   T3 — Tenant isolation (all queries scoped by tenant_id)
 *
 * Cross-Pillar Data Flow (P3IN1-003):
 *   Pillar 1 (Operations) → creates/updates offerings
 *   Pillar 2 (Brand) → reads offerings for tenant catalog
 *   Pillar 3 (Discovery) → reads offerings for public profiles
 */

export interface Offering {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  priceKobo: number | null;
  isPublished: boolean;
  sortOrder: number;
  category: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OfferingListOptions {
  tenantId: string;
  limit?: number;
  publishedOnly?: boolean;
}

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      all<T>(): Promise<{ results: T[] | null }>;
      first<T>(): Promise<T | null>;
      run(): Promise<{ success: boolean }>;
    };
  };
}

type OfferingRow = {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  price_kobo: number | null;
  is_published: number;
  sort_order: number;
  category: string | null;
  created_at: string;
  updated_at: string;
};

function rowToOffering(row: OfferingRow): Offering {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    description: row.description,
    priceKobo: row.price_kobo,
    isPublished: row.is_published === 1,
    sortOrder: row.sort_order,
    category: row.category,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listOfferings(
  db: D1Like,
  opts: OfferingListOptions,
): Promise<Offering[]> {
  const { tenantId, limit = 50, publishedOnly = true } = opts;
  const publishFilter = publishedOnly ? 'AND is_published = 1' : '';

  const result = await db
    .prepare(
      `SELECT id, tenant_id, name, description, price_kobo, is_published,
              sort_order, category, created_at, updated_at
       FROM offerings
       WHERE tenant_id = ? ${publishFilter}
       ORDER BY sort_order ASC, created_at DESC
       LIMIT ?`,
    )
    .bind(tenantId, limit)
    .all<OfferingRow>();

  return (result.results ?? []).map(rowToOffering);
}

export async function getOffering(
  db: D1Like,
  offeringId: string,
  tenantId: string,
): Promise<Offering | null> {
  const row = await db
    .prepare(
      `SELECT id, tenant_id, name, description, price_kobo, is_published,
              sort_order, category, created_at, updated_at
       FROM offerings
       WHERE id = ? AND tenant_id = ?
       LIMIT 1`,
    )
    .bind(offeringId, tenantId)
    .first<OfferingRow>();

  return row ? rowToOffering(row) : null;
}

export async function listOfferingsForDiscovery(
  db: D1Like,
  entityId: string,
  limit = 6,
): Promise<Offering[]> {
  const result = await db
    .prepare(
      `SELECT id, tenant_id, name, description, price_kobo, is_published,
              sort_order, category, created_at, updated_at
       FROM offerings
       WHERE tenant_id = ? AND is_published = 1
       ORDER BY sort_order ASC, created_at DESC
       LIMIT ?`,
    )
    .bind(entityId, limit)
    .all<OfferingRow>();

  return (result.results ?? []).map(rowToOffering);
}

export function formatPriceNaira(kobo: number): string {
  return `\u20A6${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
}
