/**
 * Built-in tool: customer_lookup
 * SA-5.x — Cross-entity CRM search across individuals and organizations.
 *
 * Platform Invariants:
 *   T3  — All queries tenant-scoped via tenantId in ToolExecutionContext
 *   P13 — Returns id, display_name, account_type, last_active_at ONLY.
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
        'phone fragment, or email fragment. Returns a list of matching contacts with ' +
        'their ID, display name, account type, and last activity date. ' +
        'Use this before creating bookings or invoices to look up the correct contact ID. ' +
        'Results include at most 10 matches.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'Name fragment, phone fragment (digits only), or email fragment to search for. ' +
              'Minimum 2 characters. Case-insensitive partial match.',
          },
          entity_type: {
            type: 'string',
            description:
              'Filter by entity type. "individual" = people, "organisation" = companies, ' +
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
    const pattern = `%${query}%`;

    type IndividualRow = {
      id: string; display_name: string; verification_state: string;
      created_at: number; updated_at: number;
    };
    type OrgRow = {
      id: string; name: string; registration_number: string | null;
      verification_state: string; created_at: number; updated_at: number;
    };

    const results: Array<{ id: string; display_name: string; account_type: string; last_active_at: number | null; verification_state: string }> = [];

    // Query individuals (P13: only id, display_name, verification_state, timestamps)
    if (entityType === 'individual' || entityType === 'all') {
      const { results: indivRows } = await ctx.db
        .prepare(
          `SELECT id, display_name, verification_state, created_at, updated_at
           FROM   individuals
           WHERE  tenant_id = ?
             AND  display_name LIKE ?
           ORDER  BY updated_at DESC
           LIMIT  10`,
        )
        .bind(ctx.tenantId, pattern)
        .all<IndividualRow>();

      for (const r of indivRows ?? []) {
        results.push({
          id: r.id,
          display_name: r.display_name,
          account_type: 'individual',
          last_active_at: r.updated_at,
          verification_state: r.verification_state,
        });
      }
    }

    // Query organizations (P13: only id, name, registration_number, verification_state)
    if (entityType === 'organisation' || entityType === 'all') {
      const { results: orgRows } = await ctx.db
        .prepare(
          `SELECT id, name, registration_number, verification_state, created_at, updated_at
           FROM   organizations
           WHERE  tenant_id = ?
             AND  name LIKE ?
           ORDER  BY updated_at DESC
           LIMIT  10`,
        )
        .bind(ctx.tenantId, pattern)
        .all<OrgRow>();

      for (const r of orgRows ?? []) {
        results.push({
          id: r.id,
          display_name: r.name,
          account_type: 'organisation',
          last_active_at: r.updated_at,
          verification_state: r.verification_state,
        });
      }
    }

    // De-duplicate (individual + org queries may each return up to 10; trim total to 10)
    const deduped = results.slice(0, 10);

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
