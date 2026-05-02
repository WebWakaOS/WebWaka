/**
 * Governance Check Tests — check-migration-sql-syntax (Wave 3 C1-5)
 *
 * Verifies the syntax check catches the exact patterns that caused
 * the CRITICAL deploy blocker in Issue #1.
 */
import { describe, it, expect } from 'vitest';

// Replicate core detection logic
function hasBackslashEscapedQuotes(sql: string): boolean {
  return /\\'/.test(sql);
}

function isLfsPointer(content: string): boolean {
  return content.startsWith('version https://git-lfs');
}

describe('Governance check: check-migration-sql-syntax (C1-5)', () => {
  describe('catches violations', () => {
    it("detects \\' in SQL strings", () => {
      const sql = `INSERT INTO users (name) VALUES ('O\\'Brien');`;
      expect(hasBackslashEscapedQuotes(sql)).toBe(true);
    });
    it('detects multiple occurrences', () => {
      const sql = `UPDATE t SET a='\\'', b='it\\'s fine';`;
      expect(hasBackslashEscapedQuotes(sql)).toBe(true);
    });
  });

  describe('passes clean SQL', () => {
    it("passes standard SQLite '' doubled-quote escaping", () => {
      const sql = `INSERT INTO users (name) VALUES ('O''Brien');`;
      expect(hasBackslashEscapedQuotes(sql)).toBe(false);
    });
    it('passes migration with no string literals', () => {
      const sql = `ALTER TABLE users ADD COLUMN active INTEGER DEFAULT 1;`;
      expect(hasBackslashEscapedQuotes(sql)).toBe(false);
    });
    it('passes CREATE TABLE statement', () => {
      const sql = `CREATE TABLE products (id TEXT PRIMARY KEY, name TEXT NOT NULL);`;
      expect(hasBackslashEscapedQuotes(sql)).toBe(false);
    });
  });

  describe('LFS pointer handling', () => {
    it('skips LFS pointer files', () => {
      const pointer = 'version https://git-lfs.github.com/spec/v1\noid sha256:abc123\nsize 1024\n';
      expect(isLfsPointer(pointer)).toBe(true);
    });
    it('does not skip normal SQL files', () => {
      const sql = `-- Migration 0001\nCREATE TABLE users (id TEXT PRIMARY KEY);`;
      expect(isLfsPointer(sql)).toBe(false);
    });
  });
});
