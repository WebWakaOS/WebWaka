#!/usr/bin/env python3
"""
apply-d1-seed-via-api.py
--------------------------
Applies a SQL seed file to a Cloudflare D1 database via the REST API /query
endpoint. Unlike `wrangler d1 execute --file`, this approach:
  1. Supports within-batch FK resolution (INSERT statement N can reference
     data inserted by statement N-1 in the same batch).
  2. Does not abort the entire batch when INSERT OR IGNORE silently skips
     a row due to a NOT NULL constraint.
  3. Automatically tracks the migration in d1_migrations on success.

Usage:
  python3 apply-d1-seed-via-api.py <db_id> <sql_file> <migration_name>

Environment:
  CLOUDFLARE_API_TOKEN  — required
  CLOUDFLARE_ACCOUNT_ID — required

Exit codes:
  0 — success (or already applied)
  1 — failure
"""

import json
import os
import sys
import urllib.request
import urllib.error

def main():
    if len(sys.argv) < 4:
        print("Usage: apply-d1-seed-via-api.py <db_id> <sql_file> <migration_name>")
        sys.exit(1)

    db_id = sys.argv[1]
    sql_file = sys.argv[2]
    migration_name = sys.argv[3]

    token = os.environ.get("CLOUDFLARE_API_TOKEN")
    account = os.environ.get("CLOUDFLARE_ACCOUNT_ID")
    if not token or not account:
        print("ERROR: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID must be set")
        sys.exit(1)

    base_url = f"https://api.cloudflare.com/client/v4/accounts/{account}/d1/database/{db_id}"

    def d1_query(sql: str) -> dict:
        payload = json.dumps({"sql": sql.strip(), "params": []}).encode("utf-8")
        req = urllib.request.Request(
            f"{base_url}/query",
            data=payload,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as e:
            return json.loads(e.read())

    # Check if already applied
    check = d1_query(
        f"SELECT COUNT(*) as cnt FROM d1_migrations WHERE name='{migration_name}'"
    )
    if not check.get('success'):
        print(f"ERROR: Could not query d1_migrations: {check.get('errors')}")
        sys.exit(1)

    cnt = check['result'][0]['results'][0]['cnt']
    if cnt > 0:
        print(f"ℹ️  {migration_name} already applied — skipping")
        sys.exit(0)

    # Read SQL file
    if not os.path.isfile(sql_file):
        print(f"ERROR: SQL file not found: {sql_file}")
        sys.exit(1)

    with open(sql_file, 'r', encoding='utf-8') as f:
        sql = f.read()

    file_size_kb = len(sql) / 1024
    print(f"Applying {migration_name} ({file_size_kb:.1f} KB) via D1 REST API...")

    # Apply the seed
    result = d1_query(sql)
    if not result.get('success'):
        errors = result.get('errors', [])
        print(f"ERROR applying {migration_name}: {errors}")
        sys.exit(1)

    # Calculate changes
    res = result.get('result', [])
    total_changes = 0
    if isinstance(res, list):
        total_changes = sum(r.get('meta', {}).get('changes', 0) for r in res if isinstance(r, dict))

    # Record in d1_migrations
    track = d1_query(
        f"INSERT OR IGNORE INTO d1_migrations (name, applied_at) VALUES ('{migration_name}', datetime('now'))"
    )
    if not track.get('success'):
        print(f"WARNING: Applied but could not record in d1_migrations: {track.get('errors')}")
    else:
        print(f"✅  {migration_name} applied ({total_changes} rows changed)")

    sys.exit(0)


if __name__ == '__main__':
    main()
