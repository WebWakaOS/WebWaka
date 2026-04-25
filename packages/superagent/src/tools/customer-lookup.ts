/**
 * Built-in tool: customer_lookup
 * SA-5.x — Cross-entity CRM search across individuals and organizations.
 * Searches by name fragment, phone fragment, or email fragment.
 * Phone/email are looked up via the contact_channels table (joined back to individuals).
 *
 * Platform Invariants:
 *   T3  — All queries tenant-scoped via tenantId in ToolExecutionContext
 *   P13 — Returns id, display_name, account_type, last_active_at, verification_state ONLY.
 *          Raw PII fields (phone, email, NIN, etc.) are never returned.
 *
 * Read-only. No autonomy gating required.
 */

import type { RegisteredTool } from '../tool-registry.js';

export const customerLookupTool: RegisteredTool = {
  definition: {
    type: 'function',
    function: {
      name: 'customer_lookup',
      description:
        'Search for customers (individuals or organisations) in this workspace by name, ' +
        'phone number fragment, or email fragment. ' +
        'Returns at most 10 matches with their ID, display name, account type, and last activity. ' +
        'Always use this tool to find the correct contact_id before creating bookings or invoices.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'Name fragment, phone number fragment (digits only, e.g. "0801"), ' +
              'or email fragment (e.g. "ada@"). ' +
              'Minimum 2 characters. Case-insensitive partial match.',
          },
          entity_type: {
            type: 'string',
            description:
              'Filter by entity type: "individual" = people, "organisation" = companies, ' +
              '"all" (default) = both.',
            enum: ['individual', 'organisation', 'all'],
          },
        },
        required: ['query'],
      },
    },
  },

  async handler(args, ctx) {
    const query = typeof args.query === 'string' ? args.query.trim() : '';
    if (query.length < 2) {
      return JSON.stringify({
        error: 'QUERY_TOO_SHORT',
        message: 'Search query must be at least 2 characters.',
      });
    }

    const entityType = typeof args.entity_type === 'string' ? args.entity_type : 'all';
    const pattern    = `%${query}%`;

    // P13: Output contract — exactly these 4 fields, nothing more.
    type ResultRow = {
      id: string;
      display_name: string;
      account_type: string;
      last_active_at: number | null;
    };

    const results: ResultRow[] = [];

    // Search individuals by name or phone/email fragment via contact_channels JOIN.
    //
    // T3 isolation: `WHERE i.tenant_id = ?` scopes the base table. The JOIN
    //   `cc.user_id = i.id` is transitive — only cc rows whose user_id belongs
    //   to an individual that already passed the tenant_id filter are visible.
    //   contact_channels has no tenant_id column (migration 0018), so tenant
    //   isolation is correctly achieved through the JOIN predicate.
    //
    // Output fields: account_type (entity kind) and last_active_at (i.updated_at)
    //   match the individuals/organizations table columns. The task spec refers to
    //   these as "account_status/last_transaction_date" in one version; we use the
    //   actual column semantics (account_type = entity kind; last_active_at = last update).
    if (entityType === 'individual' || entityType === 'all') {
      const { results: rows } = await ctx.db
        .prepare(
          `SELECT DISTINCT
             i.id,
             i.display_name,
             'individual'  AS account_type,
             i.updated_at  AS last_active_at
           FROM individuals i
           -- cc is transitively tenant-scoped via i.tenant_id = ? + cc.user_id = i.id
           LEFT JOIN contact_channels cc ON cc.user_id = i.id
           WHERE i.tenant_id = ?
             AND (
               i.display_name LIKE ?
               OR cc.value LIKE ?
             )
           ORDER BY i.updated_at DESC
           LIMIT 10`,
        )
        .bind(ctx.tenantId, pattern, pattern)
        .all<ResultRow>();

      results.push(...(rows ?? []));
    }

    // Search organizations by name or phone/email fragment via contact_channels JOIN.
    // T3: same transitive isolation pattern as individuals above.
    if (entityType === 'organisation' || entityType === 'all') {
      const { results: orgRows } = await ctx.db
        .prepare(
          `SELECT DISTINCT
             o.id,
             o.name        AS display_name,
             'organisation' AS account_type,
             o.updated_at  AS last_active_at
           FROM organizations o
           -- cc is transitively tenant-scoped via o.tenant_id = ? + cc.user_id = o.id
           LEFT JOIN contact_channels cc ON cc.user_id = o.id
           WHERE o.tenant_id = ?
             AND (
               o.name LIKE ?
               OR cc.value LIKE ?
             )
           ORDER BY o.updated_at DESC
           LIMIT 10`,
        )
        .bind(ctx.tenantId, pattern, pattern)
        .all<ResultRow>();

      results.push(...(orgRows ?? []));
    }

    // De-duplicate by id (LEFT JOIN can produce duplicates when multiple channels match).
    // P13: Explicitly pick only the 4 allowed output fields — never passthrough raw DB rows.
    const seen = new Set<string>();
    const deduped: ResultRow[] = [];
    for (const r of results) {
      if (!seen.has(r.id)) {
        seen.add(r.id);
        deduped.push({
          id: r.id,
          display_name: r.display_name,
          account_type: r.account_type,
          last_active_at: r.last_active_at,
        });
      }
      if (deduped.length >= 10) break;
    }

    if (deduped.length === 0) {
      return JSON.stringify({
        status: 'ok',
        message: `No contacts found matching '${query}'.`,
        results: [],
      });
    }

    return JSON.stringify({
      status: 'ok',
      total: deduped.length,
      results: deduped,
    });
  },
};
