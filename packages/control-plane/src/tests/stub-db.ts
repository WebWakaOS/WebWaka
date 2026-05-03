/**
 * In-memory D1Like stub for @webwaka/control-plane unit tests.
 *
 * Supports:
 *   - INSERT (with and without ON CONFLICT DO UPDATE)
 *   - INSERT OR IGNORE
 *   - UPDATE ... SET col = ? ... WHERE col = ?   (plus literal SET values)
 *   - DELETE FROM ... WHERE col = ?
 *   - SELECT * FROM ... WHERE ... LIMIT ? OFFSET ?
 *   - SELECT COUNT(*) as total FROM ...
 *   - SELECT with 2-table JOINs (specific patterns used by CP services)
 */

export type Row = Record<string, unknown>;

// ─── StubKV ──────────────────────────────────────────────────────────────────

export class StubKV {
  private store = new Map<string, string>();

  // eslint-disable-next-line @typescript-eslint/require-await
  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async put(key: string, value: string, _opts?: { expirationTtl?: number }): Promise<void> {
    this.store.set(key, value);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  snapshot(): Record<string, string> {
    return Object.fromEntries(this.store);
  }
}

// ─── StubD1 ──────────────────────────────────────────────────────────────────

// All known tables are explicit so TypeScript knows they're always Row[].
interface Tables {
  governance_audit_log: Row[];
  subscription_packages: Row[];
  package_version_history: Row[];
  billing_intervals: Row[];
  package_pricing: Row[];
  entitlement_definitions: Row[];
  package_entitlement_bindings: Row[];
  workspace_entitlement_overrides: Row[];
  permission_definitions: Row[];
  custom_roles: Row[];
  role_permission_bindings: Row[];
  user_groups: Row[];
  group_memberships: Row[];
  group_role_bindings: Row[];
  group_permission_bindings: Row[];
  user_role_assignments: Row[];
  user_permission_overrides: Row[];
  configuration_flags: Row[];
  configuration_overrides: Row[];
  admin_delegation_policies: Row[];
  delegation_capabilities: Row[];
  [key: string]: Row[]; // fallback for dynamic access
}

export class StubD1 {
  readonly t: Tables = {
    governance_audit_log: [],
    subscription_packages: [],
    package_version_history: [],
    billing_intervals: [],
    package_pricing: [],
    entitlement_definitions: [],
    package_entitlement_bindings: [],
    workspace_entitlement_overrides: [],
    permission_definitions: [],
    custom_roles: [],
    role_permission_bindings: [],
    user_groups: [],
    group_memberships: [],
    group_role_bindings: [],
    group_permission_bindings: [],
    user_role_assignments: [],
    user_permission_overrides: [],
    configuration_flags: [],
    configuration_overrides: [],
    admin_delegation_policies: [],
    delegation_capabilities: [],
  };

  seed<T extends Row>(table: string, rows: T[]): this {
    this.t[table] = [...(rows as Row[])];
    return this;
  }

  prepare(sql: string) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      bind(...args: unknown[]) {
        return {
          // eslint-disable-next-line @typescript-eslint/require-await
          async run(): Promise<{ meta: { changes: number } }> {
            const changes = self._run(sql, args);
            return { meta: { changes } };
          },
          // eslint-disable-next-line @typescript-eslint/require-await
          async first<T>(): Promise<T | null> {
            return self._queryFirst<T>(sql, args);
          },
          // eslint-disable-next-line @typescript-eslint/require-await
          async all<T>(): Promise<{ results: T[] }> {
            return { results: self._queryAll<T>(sql, args) };
          },
        };
      },
    };
  }

  // ─── Table name extraction ─────────────────────────────────────────────────

  private _table(sql: string): string {
    const m =
      /(?:INSERT\s+(?:OR\s+\w+\s+)?INTO|UPDATE|DELETE\s+FROM|FROM)\s+(\w+)/i.exec(sql);
    if (!m) throw new Error(`StubD1: cannot find table in: ${sql.substring(0, 80)}`);
    return m[1]!.toLowerCase();
  }

  private _rows(tableName: string): Row[] {
    return this.t[tableName] ?? [];
  }

  // ─── DML ──────────────────────────────────────────────────────────────────

  private _run(sql: string, args: unknown[]): number {
    const upper = sql.trim().toUpperCase();
    if (upper.startsWith('INSERT')) return this._insert(sql, args);
    if (upper.startsWith('UPDATE')) return this._update(sql, args);
    if (upper.startsWith('DELETE')) return this._delete(sql, args);
    return 0;
  }

  private _insert(sql: string, args: unknown[]): number {
    const tableName = this._table(sql);
    const table = this.t[tableName];
    if (!table) return 0;

    // Parse column list
    const colMatch = /INTO\s+\w+\s*\(([^)]+)\)/i.exec(sql);
    if (!colMatch) return 0;
    const cols = colMatch[1]!.split(',').map((c) => c.trim());

    // Parse VALUES(...) — mix of ? and literals (0, 1, NULL, 'string')
    const valMatch = /VALUES\s*\(([^)]+)\)/i.exec(sql);
    if (!valMatch) return 0;
    const valueParts = valMatch[1]!.split(',').map((v) => v.trim());

    let argIdx = 0;
    const row: Row = {};
    for (let i = 0; i < cols.length; i++) {
      const col = cols[i]!;
      const vp = valueParts[i] ?? '?';
      if (vp === '?') {
        row[col] = args[argIdx++];
      } else if (/^NULL$/i.test(vp)) {
        row[col] = null;
      } else if (/^-?\d+(\.\d+)?$/.test(vp)) {
        row[col] = Number(vp);
      } else {
        row[col] = vp.replace(/^'|'$/g, '');
      }
    }

    // ON CONFLICT … DO UPDATE
    const onConflict = /ON CONFLICT\s*\(([^)]+)\)\s*DO UPDATE SET\s+(.+)/i.exec(sql);
    if (onConflict) {
      const conflictCols = onConflict[1]!.split(',').map((c) => c.trim());
      const doUpdateStr = onConflict[2]!;

      const existingIdx = table.findIndex((r) =>
        conflictCols.every((c) => {
          const rVal = r[c];
          const rowVal = row[c];
          return (rowVal == null && rVal == null) || rVal === rowVal;
        }),
      );

      if (existingIdx >= 0) {
        const existingRow = table[existingIdx]!;
        const setClauses = doUpdateStr.split(',').map((s) => s.trim());
        for (const clause of setClauses) {
          const excMatch = /(\w+)\s*=\s*excluded\.(\w+)/i.exec(clause);
          if (excMatch) {
            existingRow[excMatch[1]!] = row[excMatch[2]!];
            continue;
          }
          const paramMatch = /(\w+)\s*=\s*\?/.exec(clause);
          if (paramMatch) {
            existingRow[paramMatch[1]!] = args[argIdx++];
          }
        }
        return 1;
      }
    }

    // INSERT OR IGNORE — skip if conflict on PK (id field only, if present)
    if (/INSERT\s+OR\s+IGNORE/i.test(sql) && row['id'] != null) {
      if (table.some((r) => r['id'] === row['id'])) return 0;
    }

    table.push(row);
    return 1;
  }

  private _update(sql: string, args: unknown[]): number {
    const tableName = this._table(sql);
    const table = this.t[tableName];
    if (!table) return 0;

    // Extract SET clause (before WHERE)
    const setMatch = /SET\s+(.+?)\s+WHERE\s+/i.exec(sql);
    if (!setMatch) return 0;
    const setStr = setMatch[1]!;

    // Extract WHERE clause
    const whereMatch = /WHERE\s+(.+)$/i.exec(sql);
    if (!whereMatch) return 0;

    // Parse SET ops — handles `col = ?` (bound) and `col = N` / `col = 'str'` (literal)
    type SetOp = { col: string; pos: number } | { col: string; literal: unknown };
    let argIdx = 0;
    const setOps: SetOp[] = [];
    for (const clause of setStr.split(',')) {
      const trimmed = clause.trim();
      const mParam = /^(\w+)\s*=\s*\?$/.exec(trimmed);
      if (mParam) { setOps.push({ col: mParam[1]!, pos: argIdx++ }); continue; }
      const mNum = /^(\w+)\s*=\s*(-?\d+)$/.exec(trimmed);
      if (mNum) { setOps.push({ col: mNum[1]!, literal: Number(mNum[2]!) }); continue; }
      const mStr = /^(\w+)\s*=\s*'([^']*)'$/.exec(trimmed);
      if (mStr) { setOps.push({ col: mStr[1]!, literal: mStr[2]! }); }
    }

    // Parse WHERE conditions (simple col = ? equality)
    const whereConditions: Array<{ col: string; pos: number }> = [];
    const whereParts = whereMatch[1]!.trim().split(/\s+AND\s+/i);
    for (const part of whereParts) {
      const m = /^(\w+)\s*=\s*\?$/.exec(part.trim());
      if (m) whereConditions.push({ col: m[1]!, pos: argIdx++ });
      // literal conditions (col = 0, col IS NULL, etc.) — no arg consumed
    }

    let changes = 0;
    for (const row of table) {
      const matches = whereConditions.every((c) => row[c.col] === args[c.pos]);
      if (matches) {
        for (const op of setOps) {
          if ('literal' in op) { row[op.col] = op.literal; }
          else { row[op.col] = args[op.pos]; }
        }
        changes++;
      }
    }
    return changes;
  }

  private _delete(sql: string, args: unknown[]): number {
    const tableName = this._table(sql);
    const table = this.t[tableName];
    if (!table) return 0;

    const whereMatch = /WHERE\s+(.+)$/i.exec(sql);
    if (!whereMatch) return 0;

    let argIdx = 0;
    const conditions: Array<{ col: string; pos: number }> = [];
    for (const part of whereMatch[1]!.trim().split(/\s+AND\s+/i)) {
      const m = /^(\w+)\s*=\s*\?$/.exec(part.trim());
      if (m) conditions.push({ col: m[1]!, pos: argIdx++ });
      // IS NULL conditions — no arg consumed; always match undefined/null values
    }

    const before = table.length;
    const kept = table.filter((row) => !conditions.every((c) => row[c.col] === args[c.pos]));
    this.t[tableName] = kept;
    return before - kept.length;
  }

  // ─── Queries ──────────────────────────────────────────────────────────────

  private _queryFirst<T>(sql: string, args: unknown[]): T | null {
    return this._queryAll<T>(sql, args)[0] ?? null;
  }

  private _queryAll<T>(sql: string, args: unknown[]): T[] {
    const upper = sql.trim().toUpperCase();
    if (upper.includes('COUNT(*)')) return this._count(sql, args) as T[];
    if (upper.includes(' JOIN '))   return this._joinQuery(sql, args) as T[];
    return this._simpleSelect(sql, args) as T[];
  }

  private _count(sql: string, args: unknown[]): Array<{ total: number }> {
    const rows = this._selectFiltered(sql, args);
    return [{ total: rows.length }];
  }

  private _simpleSelect(sql: string, args: unknown[]): Row[] {
    return this._selectFiltered(sql, args);
  }

  private _selectFiltered(sql: string, args: unknown[]): Row[] {
    const tableName = this._table(sql);
    const allRows = this._rows(tableName);

    const whereMatch = /WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|\s+GROUP|\s*$)/is.exec(sql);
    let filtered = whereMatch
      ? this._applyWhere(allRows, whereMatch[1]!, args)
      : [...allRows];

    // Apply LIMIT ? / OFFSET ? (bound params)
    const limitMatch = /LIMIT\s+\?/i.exec(sql);
    const offsetMatch = /OFFSET\s+\?/i.exec(sql);
    if (limitMatch || offsetMatch) {
      const beforeLimit  = sql.split(/\bLIMIT\b/i)[0]  ?? '';
      const beforeOffset = sql.split(/\bOFFSET\b/i)[0] ?? '';
      const limitArgIdx  = (beforeLimit.match(/\?/g) ?? []).length;
      const offsetArgIdx = offsetMatch ? (beforeOffset.match(/\?/g) ?? []).length : -1;
      const limit  = limitMatch  ? (args[limitArgIdx]  as number) : filtered.length;
      const offset = offsetMatch ? (args[offsetArgIdx] as number) : 0;
      filtered = filtered.slice(offset, offset + limit);
    }

    return filtered;
  }

  // ─── WHERE evaluator ──────────────────────────────────────────────────────

  private _applyWhere(rows: Row[], whereStr: string, args: unknown[]): Row[] {
    let argIdx = 0;
    const parts = splitAndNotInParens(whereStr.trim());
    const conditions: Array<(row: Row) => boolean> = [];

    for (const raw of parts) {
      const part = raw.trim();

      // (col IS NULL OR col > ?)
      const nullOrGtMatch = /^\(\s*(\w+)\s+IS\s+NULL\s+OR\s+(\w+)\s*>\s*\?\s*\)$/i.exec(part);
      if (nullOrGtMatch) {
        const col = nullOrGtMatch[1]!; const col2 = nullOrGtMatch[2]!;
        const val = args[argIdx++] as number;
        conditions.push((row) => row[col] == null || (row[col2] as number) > val);
        continue;
      }

      // (col = ? OR col IS NULL)
      const eqOrNullMatch = /^\(\s*(\w+)\s*=\s*\?\s+OR\s+(\w+)\s+IS\s+NULL\s*\)$/i.exec(part);
      if (eqOrNullMatch) {
        const col = eqOrNullMatch[1]!;
        const val = args[argIdx++];
        conditions.push((row) => row[col] === val || row[col] == null);
        continue;
      }

      // (col = ? OR col = ?)
      const twoOrMatch = /^\(\s*(\w+)\s*=\s*\?\s+OR\s+(\w+)\s*=\s*\?\s*\)$/i.exec(part);
      if (twoOrMatch) {
        const col1 = twoOrMatch[1]!; const col2 = twoOrMatch[2]!;
        const v1 = args[argIdx++]; const v2 = args[argIdx++];
        conditions.push((row) => row[col1] === v1 || row[col2] === v2);
        continue;
      }

      // col = ? OR col = ?  (without parens)
      const bareOrMatch = /^(\w+)\s*=\s*\?\s+OR\s+(\w+)\s*=\s*\?$/i.exec(part);
      if (bareOrMatch) {
        const col1 = bareOrMatch[1]!; const col2 = bareOrMatch[2]!;
        const v1 = args[argIdx++]; const v2 = args[argIdx++];
        conditions.push((row) => row[col1] === v1 || row[col2] === v2);
        continue;
      }

      // col IN (?,?,...)
      const inMatch = /^(\w+)\s+IN\s*\(([^)]+)\)$/i.exec(part);
      if (inMatch) {
        const col = inMatch[1]!;
        const count = (inMatch[2]!.match(/\?/g) ?? []).length;
        const vals = args.slice(argIdx, argIdx + count);
        argIdx += count;
        conditions.push((row) => vals.includes(row[col]));
        continue;
      }

      // col = ?
      const eqMatch = /^(\w+)\s*=\s*\?$/.exec(part);
      if (eqMatch) {
        const col = eqMatch[1]!; const val = args[argIdx++];
        conditions.push((row) => row[col] === val);
        continue;
      }

      // col != ?
      const neqMatch = /^(\w+)\s*!=\s*\?$/.exec(part);
      if (neqMatch) {
        const col = neqMatch[1]!; const val = args[argIdx++];
        conditions.push((row) => row[col] !== val);
        continue;
      }

      // col > ?
      const gtMatch = /^(\w+)\s*>\s*\?$/.exec(part);
      if (gtMatch) {
        const col = gtMatch[1]!; const val = args[argIdx++] as number;
        conditions.push((row) => (row[col] as number) > val);
        continue;
      }

      // col = 'literal'
      const strLiteralMatch = /^(\w+)\s*=\s*'([^']*)'$/.exec(part);
      if (strLiteralMatch) {
        const col = strLiteralMatch[1]!; const val = strLiteralMatch[2]!;
        conditions.push((row) => row[col] === val);
        continue;
      }

      // col = N  (numeric literal — no arg consumed)
      const numLiteralMatch = /^(\w+)\s*=\s*(-?\d+)$/.exec(part);
      if (numLiteralMatch) {
        const col = numLiteralMatch[1]!; const val = Number(numLiteralMatch[2]!);
        conditions.push((row) => row[col] === val);
        continue;
      }

      // col IS NULL
      const isNullMatch = /^(\w+)\s+IS\s+NULL$/i.exec(part);
      if (isNullMatch) {
        const col = isNullMatch[1]!;
        conditions.push((row) => row[col] == null);
        continue;
      }

      // col IS NOT NULL
      const isNotNullMatch = /^(\w+)\s+IS\s+NOT\s+NULL$/i.exec(part);
      if (isNotNullMatch) {
        const col = isNotNullMatch[1]!;
        conditions.push((row) => row[col] != null);
        continue;
      }
    }

    return rows.filter((row) => conditions.every((fn) => fn(row)));
  }

  // ─── JOIN queries ─────────────────────────────────────────────────────────

  private _joinQuery(sql: string, args: unknown[]): Row[] {
    const upper = sql.toUpperCase();

    if (upper.includes('ROLE_PERMISSION_BINDINGS') && upper.includes('PERMISSION_DEFINITIONS') && !upper.includes('GROUP_MEMBERSHIPS')) {
      return this._joinRolePerms(sql, args);
    }
    if (upper.includes('GROUP_MEMBERSHIPS') && upper.includes('GROUP_ROLE_BINDINGS') && !upper.includes('PERMISSION_DEFINITIONS')) {
      return this._joinGroupRoleIds(args);
    }
    if (upper.includes('GROUP_PERMISSION_BINDINGS') && upper.includes('PERMISSION_DEFINITIONS')) {
      return this._joinGroupPerms(args);
    }
    if (upper.includes('USER_PERMISSION_OVERRIDES') && upper.includes('PERMISSION_DEFINITIONS')) {
      return this._joinUserOverrides(args);
    }
    if (upper.includes('PACKAGE_ENTITLEMENT_BINDINGS') && upper.includes('ENTITLEMENT_DEFINITIONS')) {
      return this._joinPkgEntitlements(args);
    }
    if (upper.includes('WORKSPACE_ENTITLEMENT_OVERRIDES') && upper.includes('ENTITLEMENT_DEFINITIONS')) {
      return this._joinWsOverrides(args);
    }
    if (upper.includes('PACKAGE_PRICING') && upper.includes('BILLING_INTERVALS')) {
      return this._joinPricing(args);
    }
    return [];
  }

  private _joinRolePerms(sql: string, args: unknown[]): Row[] {
    const rpb = this._rows('role_permission_bindings');
    const pd  = this._rows('permission_definitions');

    let bindings: Row[];
    const inMatch = /WHERE\s+rpb\.role_id\s+IN\s*\(([^)]+)\)/i.exec(sql);
    if (inMatch) {
      const count = (inMatch[1]!.match(/\?/g) ?? []).length;
      const roleIds = args.slice(0, count);
      bindings = rpb.filter((r) => roleIds.includes(r['role_id']));
    } else {
      const roleId = args[0] as string;
      bindings = rpb.filter((r) => r['role_id'] === roleId);
    }

    return bindings.flatMap((b) => {
      const perm = pd.find((p) => p['id'] === b['permission_id']);
      return perm ? [{ ...perm, granted: b['granted'] }] : [];
    });
  }

  private _joinGroupRoleIds(args: unknown[]): Row[] {
    const userId = args[0] as string;
    const tenantId = args[1] as string;
    const now = args[2] as number;

    const groupIds = this._rows('group_memberships')
      .filter((m) => m['user_id'] === userId && m['tenant_id'] === tenantId &&
        (m['expires_at'] == null || (m['expires_at'] as number) > now))
      .map((m) => m['group_id'] as string);

    return this._rows('group_role_bindings')
      .filter((b) => groupIds.includes(b['group_id'] as string))
      .map((b) => ({ role_id: b['role_id'] }));
  }

  private _joinGroupPerms(args: unknown[]): Row[] {
    const userId = args[0] as string;
    const tenantId = args[1] as string;
    const now = args[2] as number;

    const groupIds = this._rows('group_memberships')
      .filter((m) => m['user_id'] === userId && m['tenant_id'] === tenantId &&
        (m['expires_at'] == null || (m['expires_at'] as number) > now))
      .map((m) => m['group_id'] as string);

    return this._rows('group_permission_bindings')
      .filter((b) => groupIds.includes(b['group_id'] as string))
      .flatMap((b) => {
        const perm = this._rows('permission_definitions').find((p) => p['id'] === b['permission_id']);
        return perm ? [{ code: perm['code'], granted: b['granted'] }] : [];
      });
  }

  private _joinUserOverrides(args: unknown[]): Row[] {
    const userId = args[0] as string;
    const workspaceId = args[1] as string | null;
    const now = args[2] as number;

    return this._rows('user_permission_overrides')
      .filter((o) =>
        o['user_id'] === userId &&
        (o['workspace_id'] === workspaceId || o['workspace_id'] == null) &&
        (o['expires_at'] == null || (o['expires_at'] as number) > now),
      )
      .flatMap((o) => {
        const perm = this._rows('permission_definitions').find((p) => p['id'] === o['permission_id']);
        return perm ? [{ code: perm['code'], granted: o['granted'] }] : [];
      });
  }

  private _joinPkgEntitlements(args: unknown[]): Row[] {
    const packageId = args[0] as string;
    return this._rows('package_entitlement_bindings')
      .filter((b) => b['package_id'] === packageId && b['billing_interval_id'] == null)
      .flatMap((b) => {
        const def = this._rows('entitlement_definitions').find((d) => d['id'] === b['entitlement_id']);
        return def ? [{ ...def, binding_value: b['value'], value: b['value'] }] : [];
      });
  }

  private _joinWsOverrides(args: unknown[]): Row[] {
    const workspaceId = args[0] as string;
    const now = args[1] as number;

    return this._rows('workspace_entitlement_overrides')
      .filter((o) =>
        o['workspace_id'] === workspaceId &&
        (o['expires_at'] == null || (o['expires_at'] as number) > now),
      )
      .flatMap((o) => {
        const def = this._rows('entitlement_definitions').find((d) => d['id'] === o['entitlement_id']);
        return def ? [{ code: def['code'], value_type: def['value_type'], value: o['value'] }] : [];
      });
  }

  private _joinPricing(args: unknown[]): Row[] {
    const packageId = args[0] as string;
    return this._rows('package_pricing')
      .filter((p) => p['package_id'] === packageId && p['is_active'] === 1)
      .map((p) => {
        const interval = this._rows('billing_intervals').find((b) => b['id'] === p['billing_interval_id']);
        return { ...p, interval_code: interval?.['code'], interval_label: interval?.['label'] };
      });
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function splitAndNotInParens(str: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';

  for (let i = 0; i < str.length; i++) {
    const ch = str[i]!;
    if (ch === '(') depth++;
    else if (ch === ')') depth--;

    if (depth === 0) {
      const rest = str.slice(i);
      const andMatch = /^\s+AND\s+/i.exec(rest);
      if (andMatch) {
        parts.push(current.trim());
        current = '';
        i += andMatch[0].length - 1;
        continue;
      }
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}
