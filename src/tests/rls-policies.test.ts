import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const MIGRATIONS_DIR = join(process.cwd(), 'supabase/migrations');
const RLS_FILE = '20260304000007_rls_policies.sql';

function readMigration(filename: string): string {
  return readFileSync(join(MIGRATIONS_DIR, filename), 'utf-8');
}

describe('RLS policies migration', () => {
  it('migration file exists', () => {
    expect(existsSync(join(MIGRATIONS_DIR, RLS_FILE))).toBe(true);
  });

  describe('Row Level Security enabled', () => {
    const sql = readMigration(RLS_FILE);

    it('enables RLS on categories', () => {
      expect(sql).toContain('ALTER TABLE categories ENABLE ROW LEVEL SECURITY');
    });

    it('enables RLS on forklifts', () => {
      expect(sql).toContain('ALTER TABLE forklifts ENABLE ROW LEVEL SECURITY');
    });

    it('enables RLS on forklift_specs', () => {
      expect(sql).toContain('ALTER TABLE forklift_specs ENABLE ROW LEVEL SECURITY');
    });

    it('enables RLS on inquiries', () => {
      expect(sql).toContain('ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY');
    });
  });

  describe('categories policies', () => {
    const sql = readMigration(RLS_FILE);

    it('allows public SELECT on categories', () => {
      expect(sql).toContain("ON categories FOR SELECT");
      expect(sql).toContain("USING (true)");
    });

    it('allows authenticated full access to categories', () => {
      expect(sql).toContain("ON categories FOR ALL");
      expect(sql).toContain("auth.role() = 'authenticated'");
    });
  });

  describe('forklifts policies', () => {
    const sql = readMigration(RLS_FILE);

    it('allows public SELECT only on published forklifts', () => {
      expect(sql).toContain("ON forklifts FOR SELECT");
      expect(sql).toContain("USING (is_published = true)");
    });

    it('allows authenticated full access to forklifts', () => {
      expect(sql).toContain("ON forklifts FOR ALL");
    });

    it('uses auth.role() = authenticated for admin forklifts policy', () => {
      // Count occurrences to ensure it's used in forklifts context
      const matches = sql.match(/auth\.role\(\) = 'authenticated'/g);
      expect(matches).not.toBeNull();
      expect(matches!.length).toBeGreaterThanOrEqual(4); // one per table
    });
  });

  describe('forklift_specs policies', () => {
    const sql = readMigration(RLS_FILE);

    it('allows public SELECT on specs only when parent forklift is published', () => {
      expect(sql).toContain("ON forklift_specs FOR SELECT");
      expect(sql).toContain("EXISTS");
      expect(sql).toContain("forklifts.id = forklift_specs.forklift_id");
      expect(sql).toContain("forklifts.is_published = true");
    });

    it('allows authenticated full access to forklift_specs', () => {
      expect(sql).toContain("ON forklift_specs FOR ALL");
    });
  });

  describe('inquiries policies', () => {
    const sql = readMigration(RLS_FILE);

    it('allows public INSERT on inquiries (contact form)', () => {
      expect(sql).toContain("ON inquiries FOR INSERT");
      expect(sql).toContain("WITH CHECK (true)");
    });

    it('does NOT allow public SELECT on inquiries', () => {
      // There should be no policy granting anon SELECT on inquiries
      const anonSelectMatch = sql.match(/ON inquiries FOR SELECT\s+USING \(true\)/);
      expect(anonSelectMatch).toBeNull();
    });

    it('allows authenticated full access to inquiries', () => {
      expect(sql).toContain("ON inquiries FOR ALL");
    });
  });

  describe('policy completeness', () => {
    const sql = readMigration(RLS_FILE);

    it('has exactly 8 CREATE POLICY statements', () => {
      const policies = sql.match(/CREATE POLICY/g);
      expect(policies).not.toBeNull();
      expect(policies!.length).toBe(8);
    });

    it('has no SECURITY DEFINER (should use RLS, not bypass it)', () => {
      expect(sql).not.toContain('SECURITY DEFINER');
    });
  });
});
