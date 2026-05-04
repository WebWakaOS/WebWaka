#!/usr/bin/env python3
"""
patch-political-seeds-name-split.py  (v2 — handles SQL '' escapes + keyword fixes)
------------------------------------------------------------------------------------
Rewrites INSERT OR IGNORE INTO individuals statements in the 35 political
state-assembly seed files (0467-0534) to include first_name, last_name, and
display_name columns derived from full_name.

Also fixes:
  1. Unescaped single-quotes in `keywords` column of `search_entries` inserts
     (e.g. 'dan'azumi' → 'dan''azumi')
  2. Any other string literal with unescaped apostrophes that would cause SQL
     syntax errors.

Name split rules:
  - Tokenise by whitespace (handles Arabic/Hausa/Igbo/Yoruba names with spaces)
  - first_name = first token (with '' decoded back to ')
  - last_name  = last token ('' if only one token)
  - display_name = full_name verbatim (SQL-decoded, then re-encoded)
"""

import os
import re
import sys
import glob

MIGRATIONS_DIR = os.path.join(os.path.dirname(__file__), '../../infra/db/migrations')
MIGRATIONS_DIR = os.path.abspath(MIGRATIONS_DIR)


def get_target_files():
    files = []
    for f in sorted(glob.glob(os.path.join(MIGRATIONS_DIR, '0*_political_*.sql'))):
        base = os.path.basename(f)
        if base.endswith('.rollback.sql'):
            continue
        num_str = re.match(r'^(\d+)', base)
        if not num_str:
            continue
        num = int(num_str.group(1))
        if 467 <= num <= 534:
            files.append(f)
    return files


# ── SQL string helpers ────────────────────────────────────────────────────────

def parse_sql_string(quoted: str) -> str:
    """Remove surrounding single quotes and un-escape '' → '."""
    return quoted[1:-1].replace("''", "'")


def sql_quote(s: str) -> str:
    """Single-quote and escape internal single quotes for SQL."""
    return "'" + s.replace("'", "''") + "'"


def split_name(full_name: str):
    """
    Deterministic first/last split from the SQL-decoded full_name.
    first_name = first whitespace-token
    last_name  = last whitespace-token ('' if only one token)
    display_name = full_name verbatim
    """
    tokens = full_name.split()
    if not tokens:
        return '', '', full_name
    first_name = tokens[0]
    last_name = tokens[-1] if len(tokens) > 1 else ''
    return first_name, last_name, full_name


# ── SQL single-quoted string parser ──────────────────────────────────────────
# Matches a complete SQL single-quoted string, including '' escapes.
# The SQL standard: within '...', a '' represents a literal single quote.
SQL_STRING_RE = re.compile(r"'(?:[^']|'')*'")


def find_sql_strings(text: str):
    """Return list of (start, end, matched_string) for all SQL string literals."""
    return [(m.start(), m.end(), m.group()) for m in SQL_STRING_RE.finditer(text)]


# ── individuals INSERT patcher ────────────────────────────────────────────────
# Match the entire individuals INSERT block.
# We use a two-pass approach:
#   Pass 1: match the column list line
#   Pass 2: match the VALUES block
INDIVIDUALS_HEADER = re.compile(
    r'INSERT\s+OR\s+IGNORE\s+INTO\s+individuals\s*'
    r'\(\s*id\s*,\s*full_name\s*,\s*tenant_id\s*,\s*workspace_id\s*,\s*'
    r'verification_state\s*,\s*created_at\s*,\s*updated_at\s*\)'
    r'\s*VALUES\s*\(\s*',
    re.IGNORECASE
)

def patch_individuals_inserts(content: str) -> tuple[str, int]:
    """
    Replace old-style individuals INSERT (without first/last/display_name) with
    the new 10-column form.  Returns (patched_content, count).
    """
    result = []
    count = 0
    pos = 0

    for m in INDIVIDUALS_HEADER.finditer(content):
        # Add everything before this match
        result.append(content[pos:m.start()])

        # Now parse the VALUES: we expect 7 SQL values separated by commas
        # starting right after the '(' that INDIVIDUALS_HEADER consumed.
        after_open = m.end()  # position right after the '('

        # Collect the 7 values: id, full_name, tenant_id, workspace_id,
        #   verification_state, created_at, updated_at
        values = []
        scan_pos = after_open
        while len(values) < 7 and scan_pos < len(content):
            # Skip whitespace/commas
            while scan_pos < len(content) and content[scan_pos] in (' ', '\t', '\n', '\r', ','):
                scan_pos += 1
            if scan_pos >= len(content):
                break
            if content[scan_pos] == ')':
                # End of VALUES only if we're at depth 0
                scan_pos += 1
                break
            if content[scan_pos] == "'":
                # SQL string
                sm = SQL_STRING_RE.match(content, scan_pos)
                if sm:
                    values.append(sm.group())
                    scan_pos = sm.end()
                else:
                    # Fallback: advance one char
                    scan_pos += 1
            else:
                # Non-string token: read until comma or unbalanced ')'
                # Use depth counter to handle tokens like unixepoch()
                token_end = scan_pos
                depth = 0
                while token_end < len(content):
                    ch = content[token_end]
                    if ch == '(':
                        depth += 1
                        token_end += 1
                    elif ch == ')':
                        if depth == 0:
                            break  # end of VALUES
                        depth -= 1
                        token_end += 1
                    elif ch == ',' and depth == 0:
                        break  # end of this value
                    else:
                        token_end += 1
                values.append(content[scan_pos:token_end].strip())
                scan_pos = token_end

        # Find the closing ');' of this INSERT
        close_semi = content.find(');', scan_pos)
        if close_semi == -1:
            # Fall back: can't parse, emit original
            result.append(content[m.start():])
            pos = len(content)
            break

        end_of_insert = close_semi + 2  # include the ');'

        if len(values) == 7:
            id_val, full_name_quoted, tenant_id_val, workspace_id_val, \
                verification_val, created_val, updated_val = values

            full_name = parse_sql_string(full_name_quoted)
            first_name, last_name, display_name = split_name(full_name)

            new_insert = (
                "INSERT OR IGNORE INTO individuals\n"
                "  (id, full_name, first_name, last_name, display_name,\n"
                "   tenant_id, workspace_id, verification_state, created_at, updated_at)\n"
                "VALUES (\n"
                f"  {id_val}, {full_name_quoted},\n"
                f"  {sql_quote(first_name)}, {sql_quote(last_name)}, {sql_quote(display_name)},\n"
                f"  {tenant_id_val}, {workspace_id_val}, {verification_val},\n"
                f"  {created_val}, {updated_val}\n"
                ");"
            )
            result.append(new_insert)
            count += 1
        else:
            # Could not parse correctly — emit original unchanged
            result.append(content[m.start():end_of_insert])

        pos = end_of_insert

    result.append(content[pos:])
    return ''.join(result), count


# ── keywords unescaped-apostrophe fixer ──────────────────────────────────────
# Find search_entries INSERT blocks and fix unescaped apostrophes in their
# string literals (especially the keywords column).

def fix_search_entries_keywords(content: str) -> tuple[str, int]:
    """
    Fix broken SQL string literals in search_entries INSERT blocks caused by
    unescaped apostrophes in name-derived keywords (e.g. 'dan'azumi keywords...'
    should be 'dan''azumi keywords...').

    Strategy: scan the file line by line. For each line that looks like a
    keywords value (a SQL string literal containing lowercase words with
    a mid-word single quote), re-escape the apostrophes.

    A "broken" keyword line looks like:
        '...word'word ...'
    An apostrophe mid-word in a lowercase keywords string should always be ''.
    """
    # Line-by-line scan for keywords values that contain [a-z]'[a-z]
    # A keyword line in search_entries is typically a bare string literal
    # starting with ' and containing lowercase words, digits, and spaces only.
    BROKEN_KW_RE = re.compile(
        r"^(\s*)'((?:[^'\n]*[a-z])'[a-z][^'\n]*)'(,?\s*)$"
    )

    lines = content.split('\n')
    fixed_lines = []
    fixes = 0
    for line in lines:
        m = BROKEN_KW_RE.match(line)
        if m:
            # This line has an unescaped apostrophe in a lowercase string
            indent, inner, trail = m.group(1), m.group(2), m.group(3)
            # Fix ALL [a-z]'[a-z] patterns in inner (the content WITHOUT outer quotes)
            inner_fixed = re.sub(r"(?<=[a-z])'(?=[a-z])", "''", inner)
            # Re-escape any remaining mid-word apostrophes missed by above
            inner_fixed = re.sub(r"(?<=[a-zA-Z])'(?=[a-zA-Z])", "''", inner_fixed)
            if inner_fixed != inner:
                fixed_lines.append(f"{indent}'{inner_fixed}'{trail}")
                fixes += 1
                continue
        fixed_lines.append(line)

    return '\n'.join(fixed_lines), fixes


# ── Main ──────────────────────────────────────────────────────────────────────

def patch_file(filepath: str, dry_run: bool = False) -> dict:
    with open(filepath, 'r', encoding='utf-8') as fh:
        original = fh.read()

    # Step 1: patch individuals inserts
    patched, ind_count = patch_individuals_inserts(original)

    # Step 2: fix search_entries keywords
    patched, kw_count = fix_search_entries_keywords(patched)

    total = ind_count + kw_count

    if total == 0:
        return {'file': filepath, 'status': 'skipped', 'ind': 0, 'kw': 0}

    if patched == original:
        return {'file': filepath, 'status': 'no_change', 'ind': 0, 'kw': 0}

    if not dry_run:
        with open(filepath, 'w', encoding='utf-8') as fh:
            fh.write(patched)

    return {'file': filepath, 'status': 'patched', 'ind': ind_count, 'kw': kw_count}


def main():
    dry_run = '--dry-run' in sys.argv
    files = get_target_files()

    if not files:
        print("ERROR: No target files found. Check MIGRATIONS_DIR:", MIGRATIONS_DIR)
        sys.exit(1)

    print(f"{'DRY RUN — ' if dry_run else ''}Patching {len(files)} political seed files (v2)\n")

    total_ind = 0
    total_kw = 0
    patched_count = 0
    for f in files:
        result = patch_file(f, dry_run=dry_run)
        base = os.path.basename(result['file'])
        status = result['status']
        ind = result['ind']
        kw = result['kw']
        symbol = '✅' if status == 'patched' else ('⏭ ' if status == 'skipped' else '→')
        print(f"  {symbol} {base}: {status} (ind:{ind}, kw_fixes:{kw})")
        if status == 'patched':
            patched_count += 1
            total_ind += ind
            total_kw += kw

    print(f"\n{'DRY RUN COMPLETE' if dry_run else 'PATCH COMPLETE'}")
    print(f"  Files patched:              {patched_count}/{len(files)}")
    print(f"  individuals inserts:        {total_ind}")
    print(f"  keywords apostrophe fixes:  {total_kw}")

    if dry_run:
        print("\nRe-run without --dry-run to apply changes.")


if __name__ == '__main__':
    main()
